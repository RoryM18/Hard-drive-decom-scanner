import { DriveRecord } from "../types";

const KEY = "drive-decom-records";

export function loadRecords(): DriveRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DriveRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: DriveRecord[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    // storage unavailable (private browsing, quota) — records still live in memory for this session
  }
}
