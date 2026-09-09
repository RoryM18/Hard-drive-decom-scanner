import { useState } from "react";
import { decodeBarcodeFromImage, loadImageFromFile } from "../lib/imageFile";
import { imageToCanvas, recognizeFrame } from "../lib/ocr";
import { parseLabelText, ParsedGuess } from "../lib/parse";

interface Props {
  onSerialDetected: (serial: string) => void;
  onOcrResult: (guess: ParsedGuess, rawText: string) => void;
}

export function ImageUpload({ onSerialDetected, onOcrResult }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const image = await loadImageFromFile(file);

      const serial = await decodeBarcodeFromImage(image);
      if (serial) onSerialDetected(serial);

      const canvas = imageToCanvas(image);
      const text = await recognizeFrame(canvas);
      onOcrResult(parseLabelText(text), text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-upload">
      <label className="image-upload-label">
        <span>Or upload a photo of the label</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={busy}
        />
      </label>
      {busy && <p className="scanner-hint">Reading label…</p>}
      {error && <p className="scanner-error">{error}</p>}
      {previewUrl && !busy && (
        <img src={previewUrl} alt="Uploaded label preview" className="image-upload-preview" />
      )}
    </div>
  );
}
