import { DriveRecord } from "../types";
import { downloadCsv } from "../lib/csv";

interface Props {
  records: DriveRecord[];
  onDelete: (id: string) => void;
}

export function RecordsTable({ records, onDelete }: Props) {
  return (
    <div className="records">
      <div className="records-header">
        <h2>Scanned drives ({records.length})</h2>
        <button type="button" onClick={() => downloadCsv(records)} disabled={records.length === 0}>
          Export CSV
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Serial</th>
            <th>Make</th>
            <th>Model</th>
            <th>Capacity</th>
            <th>Asset tag</th>
            <th>Tech</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.scannedAt).toLocaleTimeString()}</td>
              <td>{r.serial}</td>
              <td>{r.make}</td>
              <td>{r.model}</td>
              <td>{r.capacity}</td>
              <td>{r.deviceAssetTag}</td>
              <td>{r.technician}</td>
              <td>
                <button type="button" onClick={() => onDelete(r.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
