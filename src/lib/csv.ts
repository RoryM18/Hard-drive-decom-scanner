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

export async function downloadCsv(records: DriveRecord[], filename = "drive-decom-log.csv") {
  const csv = recordsToCsv(records);
  const file = new File([csv], filename, { type: "text/csv;charset=utf-8;" });

  // on phones, hand straight to the native share sheet (OneDrive shows up
  // as a target directly) instead of making the tech dig through Downloads
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // fall through to plain download if sharing failed for any other reason
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
