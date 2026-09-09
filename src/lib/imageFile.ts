import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });
}

export async function decodeBarcodeFromImage(image: HTMLImageElement): Promise<string | null> {
  try {
    const reader = new BrowserMultiFormatReader();
    const result = await reader.decodeFromImageElement(image);
    return result.getText();
  } catch (err) {
    if (err instanceof NotFoundException) return null;
    throw err;
  }
}
