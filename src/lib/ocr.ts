import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
  }
  return workerPromise;
}

export async function recognizeFrame(canvas: HTMLCanvasElement): Promise<string> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(canvas);
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
