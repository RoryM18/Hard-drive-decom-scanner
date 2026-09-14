import writeXlsxFile, { Column } from "write-excel-file/browser";
import { DriveRecord } from "../types";

const COLUMNS: Column<DriveRecord>[] = [
  {
    header: "Scanned at",
    width: 18,
    cell: (r) => ({ type: Date, value: new Date(r.scannedAt), format: "dd/mm/yyyy hh:mm" }),
  },
  { header: "Serial number", width: 20, cell: (r) => ({ type: String, value: r.serial }) },
  { header: "Make", width: 16, cell: (r) => ({ type: String, value: r.make }) },
  { header: "Model", width: 18, cell: (r) => ({ type: String, value: r.model }) },
  { header: "Capacity", width: 10, cell: (r) => ({ type: String, value: r.capacity }) },
  { header: "Device asset tag", width: 16, cell: (r) => ({ type: String, value: r.deviceAssetTag }) },
  { header: "Technician", width: 14, cell: (r) => ({ type: String, value: r.technician }) },
  { header: "Notes", width: 26, cell: (r) => ({ type: String, value: r.notes }) },
];

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

async function recordsToXlsxFile(
  records: DriveRecord[],
  filename: string
): Promise<File> {
  const blob = await writeXlsxFile(records, { columns: COLUMNS, sheet: "Decommissioned drives" }).toBlob();
  return new File([blob], filename, { type: XLSX_MIME });
}

/**
 * Downloads a real .xlsx workbook (not a renamed CSV) so it opens correctly
 * in Excel once the user taps the downloaded file.
 */
export async function exportRecords(records: DriveRecord[], filename = "drive-decom-log.xlsx") {
  const file = await recordsToXlsxFile(records, filename);

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
