import { useCallback, useEffect, useState } from "react";
import { CameraScanner } from "./components/CameraScanner";
import { ImageUpload } from "./components/ImageUpload";
import { RecordForm } from "./components/RecordForm";
import { RecordsTable } from "./components/RecordsTable";
import { DriveRecord, emptyDraft } from "./types";
import { loadRecords, saveRecords } from "./lib/storage";
import { ParsedGuess } from "./lib/parse";

type Draft = Omit<DriveRecord, "id" | "scannedAt">;

export default function App() {
  const [records, setRecords] = useState<DriveRecord[]>(() => loadRecords());
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const [lastOcrText, setLastOcrText] = useState<string>("");

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const handleSerialDetected = useCallback((serial: string) => {
    setDraft((d) => (d.serial === serial ? d : { ...d, serial }));
  }, []);

  const handleOcrResult = useCallback((guess: ParsedGuess, rawText: string) => {
    setLastOcrText(rawText);
    setDraft((d) => ({
      ...d,
      serial: d.serial || guess.serial,
      make: d.make || guess.make,
      model: d.model || guess.model,
      capacity: d.capacity || guess.capacity,
    }));
  }, []);

  function handleSave() {
    const record: DriveRecord = {
      ...draft,
      id: crypto.randomUUID(),
      scannedAt: new Date().toISOString(),
    };
    setRecords((r) => [record, ...r]);
    setDraft((d) => ({ ...emptyDraft(), technician: d.technician }));
  }

  function handleDelete(id: string) {
    setRecords((r) => r.filter((rec) => rec.id !== id));
  }

  return (
    <div className="app">
      <h1>Hard Drive Decom Scanner</h1>
      <CameraScanner onSerialDetected={handleSerialDetected} onOcrResult={handleOcrResult} />
      <ImageUpload onSerialDetected={handleSerialDetected} onOcrResult={handleOcrResult} />
      {lastOcrText && (
        <details className="ocr-raw">
          <summary>Raw OCR text (check this if a field looks wrong)</summary>
          <pre>{lastOcrText}</pre>
        </details>
      )}
      <RecordForm draft={draft} onChange={setDraft} onSave={handleSave} />
      <RecordsTable records={records} onDelete={handleDelete} />
    </div>
  );
}
