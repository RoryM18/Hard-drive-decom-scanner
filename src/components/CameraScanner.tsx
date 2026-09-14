import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { captureVideoFrame, recognizeFrame } from "../lib/ocr";
import { parseLabelText, ParsedGuess } from "../lib/parse";

interface Props {
  onSerialDetected: (serial: string) => void;
  onOcrResult: (guess: ParsedGuess, rawText: string) => void;
}

export function CameraScanner({ onSerialDetected, onOcrResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [lastSerial, setLastSerial] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const rearCamera =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ??
          devices[devices.length - 1];

        if (!videoRef.current || cancelled) return;

        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(
          rearCamera?.deviceId,
          videoRef.current,
          (result) => {
            if (result) {
              const text = result.getText();
              setLastSerial(text);
              onSerialDetected(text);
            }
          }
        );
        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
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
          Barcode read: <span className="pill">{lastSerial}</span>
        </p>
      )}
      <button type="button" className="btn btn-primary btn-block" onClick={handleCaptureForOcr} disabled={ocrBusy}>
        {ocrBusy ? "Reading label…" : "Capture label (model / make / capacity)"}
      </button>
    </div>
  );
}
