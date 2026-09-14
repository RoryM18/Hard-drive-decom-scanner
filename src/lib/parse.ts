const KNOWN_MAKES = [
  "Seagate",
  "Western Digital",
  "WD",
  "Toshiba",
  "Samsung",
  "Kingston",
  "Crucial",
  "SanDisk",
  "Hitachi",
  "HGST",
  "Intel",
  "Micron",
  "ADATA",
  "SK hynix",
  "Lite-On",
  "Fujitsu",
];

// Explicit "Capacity: 1TB" style line, checked first — most reliable when present.
const CAPACITY_LINE_RE = /(capacity)\s*[:#]?\s*(\d{1,4}(?:\.\d{1,2})?)\s?(GB|TB|MB)/i;
// Bare "500GB" / "1TB" anywhere, but NOT followed by "/" — that's an interface
// speed like "SATA 6Gb/s" or "600MB/s", not a storage capacity, and was the
// biggest source of false positives.
const CAPACITY_RE = /\b(\d{1,4}(?:\.\d{1,2})?)\s?(GB|TB|MB)\b(?!\s*\/)/i;

const MODEL_LINE_RE = /(model|part\s?no\.?|part\s?number|p\/n)\s*[:#]?\s*([A-Z0-9-]{4,})/i;
const SERIAL_LINE_RE =
  /(serial\s?(no\.?|number)?|ser\.?\s?no\.?|s\/n|sn)\s*[:#]\s*([A-Z0-9-]{4,})/i;
const BARE_CODE_RE = /\b([A-Z]{1,4}\d[A-Z0-9]{4,})\b/g;

export interface ParsedGuess {
  make: string;
  model: string;
  capacity: string;
  serial: string;
}

/**
 * knownSerial (e.g. already read from a barcode) is excluded from candidate
 * model matches — labels often print the serial as plain text too, and
 * without that exclusion the same digits get guessed as both fields.
 */
export function parseLabelText(rawText: string, knownSerial = ""): ParsedGuess {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const make = KNOWN_MAKES.find((m) => rawText.toLowerCase().includes(m.toLowerCase())) ?? "";

  let model = "";
  let serial = "";
  for (const line of lines) {
    if (!model) {
      const labelledModel = line.match(MODEL_LINE_RE);
      if (labelledModel) model = labelledModel[2];
    }
    if (!serial) {
      const labelledSerial = line.match(SERIAL_LINE_RE);
      if (labelledSerial) serial = labelledSerial[3];
    }
    if (model && serial) break;
  }

  if (!model) {
    const candidates = [...rawText.matchAll(BARE_CODE_RE)].map((m) => m[1]);
    model = candidates.find((c) => c !== knownSerial && c !== serial) ?? "";
  }

  const labelledCapacity = rawText.match(CAPACITY_LINE_RE);
  const capacityMatch = labelledCapacity
    ? [labelledCapacity[0], labelledCapacity[2], labelledCapacity[3]]
    : rawText.match(CAPACITY_RE);
  const capacity = capacityMatch ? `${capacityMatch[1]}${capacityMatch[2].toUpperCase()}` : "";

  return { make, model, capacity, serial };
}
