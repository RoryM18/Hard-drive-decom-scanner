export interface DriveRecord {
  id: string;
  serial: string;
  make: string;
  model: string;
  capacity: string;
  deviceAssetTag: string;
  technician: string;
  scannedAt: string;
  notes: string;
}

export const emptyDraft = (): Omit<DriveRecord, "id" | "scannedAt"> => ({
  serial: "",
  make: "",
  model: "",
  capacity: "",
  deviceAssetTag: "",
  technician: "",
  notes: "",
});
