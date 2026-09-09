import { DriveRecord } from "../types";

const COLUMNS: (keyof DriveRecord)[] = [
  "scannedAt",
  "serial",
  "make",
  "model",
  "capacity",
  "deviceAssetTag",
  "technician",
  "notes",
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function recordsToCsv(records: DriveRecord[]): string {
  const header = COLUMNS.join(",");
  const rows = records.map((r) => COLUMNS.map((c) => csvEscape(r[c] ?? "")).join(","));
  return [header, ...rows].join("\r\n");
}

export function downloadCsv(records: DriveRecord[], filename = "drive-decom-log.csv") {
  const csv = recordsToCsv(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
