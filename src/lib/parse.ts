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

const CAPACITY_RE = /\b(\d{2,4}\s?(GB|TB|MB))\b/i;
const MODEL_LINE_RE = /(model|part\s?no\.?|part\s?number|p\/n)\s*[:#]?\s*([A-Z0-9-]{4,})/i;
const BARE_MODEL_RE = /\b([A-Z]{1,4}\d[A-Z0-9]{4,})\b/;

export interface ParsedGuess {
  make: string;
  model: string;
  capacity: string;
}

export function parseLabelText(rawText: string): ParsedGuess {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const make =
    KNOWN_MAKES.find((m) => rawText.toLowerCase().includes(m.toLowerCase())) ?? "";

  let model = "";
  for (const line of lines) {
    const labelled = line.match(MODEL_LINE_RE);
    if (labelled) {
      model = labelled[2];
      break;
    }
  }
  if (!model) {
    const bare = rawText.match(BARE_MODEL_RE);
    if (bare) model = bare[1];
  }

  const capacityMatch = rawText.match(CAPACITY_RE);
  const capacity = capacityMatch ? capacityMatch[1].replace(/\s+/, "") : "";

  return { make, model, capacity };
}
