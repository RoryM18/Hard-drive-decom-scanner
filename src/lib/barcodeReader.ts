import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

/**
 * Drive/SSD labels are printed almost exclusively in Code 39 or Code 128.
 * Restricting to just those (instead of ZXing's default of trying every
 * supported symbology) cuts down on false-positive decodes from unrelated
 * line patterns elsewhere on a busy label, and is faster per frame.
 */
function driveLabelHints(): Map<DecodeHintType, unknown> {
  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_39, BarcodeFormat.CODE_128]);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return hints;
}

export function createBarcodeReader(): BrowserMultiFormatReader {
  return new BrowserMultiFormatReader(driveLabelHints());
}
