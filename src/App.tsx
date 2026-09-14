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
  const [serialMismatch, setSerialMismatch] = useState<string | null>(null);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const handleSerialDetected = useCallback((serial: string) => {
    setSerialMismatch(null);
    setDraft((d) => (d.serial === serial ? d : { ...d, serial }));
  }, []);

  const handleOcrResult = useCallback((guess: ParsedGuess, rawText: string) => {
    setLastOcrText(rawText);
    setDraft((d) => {
      // if the barcode already set a serial, don't silently overwrite it —
      // but flag it when the label's printed "S/N:" text disagrees, since
      // that usually means the wrong barcode on the label got scanned
      if (d.serial && guess.serial && guess.serial !== d.serial) {
        setSerialMismatch(guess.serial);
      }
      return {
        ...d,
        serial: d.serial || guess.serial,
        make: d.make || guess.make,
        model: d.model || guess.model,
        capacity: d.capacity || guess.capacity,
      };
    });
  }, []);

  function handleDraftChange(next: Draft) {
    setSerialMismatch(null);
    setDraft(next);
  }

  function handleSave() {
    const record: DriveRecord = {
      ...draft,
      id: crypto.randomUUID(),
      scannedAt: new Date().toISOString(),
    };
    setRecords((r) => [record, ...r]);
    setDraft((d) => ({ ...emptyDraft(), technician: d.technician }));
    setSerialMismatch(null);
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
        {serialMismatch && (
          <p className="warning-banner">
            Label text says the serial is <strong>{serialMismatch}</strong>, but the scanned
            barcode read <strong>{draft.serial}</strong> — this usually means a different
            barcode (e.g. part number) got scanned. Double-check before saving.
          </p>
        )}
        <RecordForm draft={draft} onChange={handleDraftChange} onSave={handleSave} />
      </div>

      <RecordsTable records={records} onDelete={handleDelete} />
    </div>
  );
}
