import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { createBarcodeReader } from "../lib/barcodeReader";
import { captureVideoFrame, recognizeFrame } from "../lib/ocr";
import { parseLabelText, ParsedGuess } from "../lib/parse";

interface Props {
  onSerialDetected: (serial: string) => void;
  onOcrResult: (guess: ParsedGuess, rawText: string) => void;
}

export function CameraScanner({ onSerialDetected, onOcrResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  // Drive labels usually carry more than one barcode (part number, serial
  // number, sometimes a date code) — once we've accepted a read, further
  // decodes are ignored until the tech explicitly asks to rescan, so the
  // camera drifting across a second barcode can't silently swap the value.
  const lockedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [lastSerial, setLastSerial] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const rearCamera =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ??
          devices[devices.length - 1];

        if (!videoRef.current || cancelled) return;

        const reader = createBarcodeReader();
        const controls = await reader.decodeFromVideoDevice(
          rearCamera?.deviceId,
          videoRef.current,
          (result) => {
            if (result && !lockedRef.current) {
              const text = result.getText();
              lockedRef.current = true;
              setLastSerial(text);
              setLocked(true);
              onSerialDetected(text);
            }
          }
        );
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
          tryEnableContinuousFocus(videoRef.current);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Camera access failed");
      }
    }

    start();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onSerialDetected]);

  function handleRescan() {
    lockedRef.current = false;
    setLocked(false);
  }

  async function handleCaptureForOcr() {
    if (!videoRef.current) return;
    setOcrBusy(true);
    try {
      const canvas = captureVideoFrame(videoRef.current);
      const text = await recognizeFrame(canvas);
      onOcrResult(parseLabelText(text, lastSerial ?? ""), text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR failed");
    } finally {
      setOcrBusy(false);
    }
  }

  return (
    <div className="scanner">
      <div className="scanner-frame">
        <video ref={videoRef} className="scanner-video" muted playsInline />
        <div className="scanner-guide" />
      </div>
      {error && <p className="scanner-error">Camera error: {error}</p>}
      {lastSerial && (
        <p className="scanner-hint">
          {locked ? "Barcode locked:" : "Barcode read:"} <span className="pill">{lastSerial}</span>
          {locked && (
            <button type="button" className="link-btn" onClick={handleRescan}>
              Wrong barcode? Rescan
            </button>
          )}
        </p>
      )}
      <button type="button" className="btn btn-primary btn-block" onClick={handleCaptureForOcr} disabled={ocrBusy}>
        {ocrBusy ? "Reading label…" : "Capture label (model / make / capacity)"}
      </button>
    </div>
  );
}

/**
 * Phones often default to a fixed/slow focus that struggles with small
 * close-up label text — nudging the track to continuous autofocus where the
 * browser supports it noticeably helps both barcode and OCR accuracy.
 */
function tryEnableContinuousFocus(video: HTMLVideoElement) {
  const stream = video.srcObject;
  if (!(stream instanceof MediaStream)) return;
  const track = stream.getVideoTracks()[0];
  const capabilities = track?.getCapabilities?.();
  if (capabilities && "focusMode" in capabilities) {
    track.applyConstraints({ advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet] }).catch(() => {});
  }
}
