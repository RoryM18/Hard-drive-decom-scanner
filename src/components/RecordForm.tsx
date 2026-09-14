import { DriveRecord } from "../types";

type Draft = Omit<DriveRecord, "id" | "scannedAt">;

interface Props {
  draft: Draft;
  onChange: (draft: Draft) => void;
  onSave: () => void;
}

const FIELDS: { key: keyof Draft; label: string; required?: boolean; span2?: boolean }[] = [
  { key: "serial", label: "Serial number", required: true, span2: true },
  { key: "make", label: "Make" },
  { key: "model", label: "Model number" },
  { key: "capacity", label: "Capacity" },
  { key: "deviceAssetTag", label: "Device asset tag" },
  { key: "technician", label: "Technician" },
  { key: "notes", label: "Notes", span2: true },
];

export function RecordForm({ draft, onChange, onSave }: Props) {
  function update(key: keyof Draft, value: string) {
    onChange({ ...draft, [key]: value });
  }

  const canSave = draft.serial.trim().length > 0;

  return (
    <form
      className="record-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) onSave();
      }}
    >
      {FIELDS.map(({ key, label, required, span2 }) => (
        <label key={key} className={span2 ? "record-field span-2" : "record-field"}>
          <span>
            {label}
            {required ? " *" : ""}
          </span>
          <input
            value={draft[key]}
            onChange={(e) => update(key, e.target.value)}
            required={required}
          />
        </label>
      ))}
      <button type="submit" className="btn btn-primary span-2" disabled={!canSave}>
        Add to log
      </button>
    </form>
  );
}
