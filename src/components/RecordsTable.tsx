import { DriveRecord } from "../types";
import { downloadCsv } from "../lib/csv";
import { DownloadIcon, TrashIcon } from "./icons";

interface Props {
  records: DriveRecord[];
  onDelete: (id: string) => void;
}

export function RecordsTable({ records, onDelete }: Props) {
  return (
    <div className="card">
      <div className="records-header">
        <div className="card-title">
          <h2>Scanned drives</h2>
          <span className="records-count">{records.length}</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => downloadCsv(records)}
          disabled={records.length === 0}
        >
          <DownloadIcon size={15} /> Export CSV
        </button>
      </div>

      {records.length === 0 ? (
        <p className="empty-state">No drives scanned yet — scan a barcode or upload a label photo to get started.</p>
      ) : (
        <div className="records-list">
          {records.map((r) => (
            <div key={r.id} className="record-card">
              <div className="record-card-top">
                <span className="record-card-serial">{r.serial}</span>
                <span className="record-card-time">
                  {new Date(r.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="record-card-meta">
                {r.make && <span><strong>{r.make}</strong></span>}
                {r.model && <span>{r.model}</span>}
                {r.capacity && <span>{r.capacity}</span>}
                {r.deviceAssetTag && <span>Tag: {r.deviceAssetTag}</span>}
                {r.technician && <span>{r.technician}</span>}
              </div>
              <button
                type="button"
                className="btn btn-icon"
                style={{ justifySelf: "end" }}
                onClick={() => onDelete(r.id)}
                aria-label="Remove record"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
