import { useState } from "react";
import { CameraScanner } from "./CameraScanner";
import { ImageUpload } from "./ImageUpload";
import { ParsedGuess } from "../lib/parse";
import { CameraIcon, UploadIcon } from "./icons";

interface Props {
  onSerialDetected: (serial: string) => void;
  onOcrResult: (guess: ParsedGuess, rawText: string) => void;
}

type Mode = "camera" | "upload";

export function ScanPanel({ onSerialDetected, onOcrResult }: Props) {
  const [mode, setMode] = useState<Mode>("camera");

  return (
    <div className="card">
      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={mode === "camera"}
          onClick={() => setMode("camera")}
        >
          <CameraIcon size={15} /> Live camera
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={mode === "upload"}
          onClick={() => setMode("upload")}
        >
          <UploadIcon size={15} /> Upload photo
        </button>
      </div>

      {mode === "camera" ? (
        <CameraScanner onSerialDetected={onSerialDetected} onOcrResult={onOcrResult} />
      ) : (
        <ImageUpload onSerialDetected={onSerialDetected} onOcrResult={onOcrResult} />
      )}
    </div>
  );
}
