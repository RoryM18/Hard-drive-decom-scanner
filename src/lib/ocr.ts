import { createWorker, PSM } from "tesseract.js";

const LABEL_CHAR_WHITELIST =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:/.,-# ";

let workerPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng").then(async (worker) => {
      // drive labels are scattered fields (model/serial/capacity/logos), not
      // paragraphs — SPARSE_TEXT finds text blocks in no particular layout
      // instead of assuming one reading column, which is closer to reality here.
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        tessedit_char_whitelist: LABEL_CHAR_WHITELIST,
      });
      return worker;
    });
  }
  return workerPromise;
}

export async function recognizeFrame(canvas: HTMLCanvasElement): Promise<string> {
  const worker = await getWorker();
  const processed = preprocessForOcr(canvas);
  const {
    data: { text },
  } = await worker.recognize(processed);
  return text;
}

export function captureVideoFrame(video: HTMLVideoElement): HTMLCanvasElement {
  return elementToCanvas(video, video.videoWidth, video.videoHeight);
}

export function imageToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  return elementToCanvas(image, image.naturalWidth, image.naturalHeight);
}

function elementToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

const MIN_OCR_WIDTH = 1200;

/**
 * Drive labels are small, low-contrast print on shiny/metallic backgrounds —
 * Tesseract does much better on an upscaled, grayscale, contrast-stretched
 * version than on the raw camera frame.
 */
function preprocessForOcr(source: HTMLCanvasElement): HTMLCanvasElement {
  const scale = source.width < MIN_OCR_WIDTH ? MIN_OCR_WIDTH / source.width : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;

  // grayscale pass, tracking min/max for a contrast stretch below
  let min = 255;
  let max = 0;
  const gray = new Uint8ClampedArray(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }

  const range = max - min || 1;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const stretched = ((gray[p] - min) / range) * 255;
    data[i] = data[i + 1] = data[i + 2] = stretched;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
