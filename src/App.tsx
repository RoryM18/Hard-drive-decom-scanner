import { useCallback, useEffect, useState } from "react";
import { ScanPanel } from "./components/ScanPanel";
import { RecordForm } from "./components/RecordForm";
import { RecordsTable } from "./components/RecordsTable";
import { DriveIcon } from "./components/icons";
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
      <header className="app-header">
        <div className="app-header-icon">
          <DriveIcon />
        </div>
        <div>
          <h1>Drive Decom Scanner</h1>
          <p>Scan, confirm, log — then export</p>
        </div>
      </header>

      <ScanPanel onSerialDetected={handleSerialDetected} onOcrResult={handleOcrResult} />

      {lastOcrText && (
        <details className="ocr-raw">
          <summary>Raw OCR text (check this if a field looks wrong)</summary>
          <pre>{lastOcrText}</pre>
        </details>
      )}

      <div className="card">
        <div className="card-title">
          <h2>Confirm details</h2>
        </div>
        <RecordForm draft={draft} onChange={setDraft} onSave={handleSave} />
      </div>

      <RecordsTable records={records} onDelete={handleDelete} />
    </div>
  );
}
