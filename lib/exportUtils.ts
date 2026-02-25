/**
 * Sequential batch download of 4 processed canvases as 1.png–4.png.
 * Files map to X (Twitter) 4-image grid posting order:
 *   1.png = top-left    (posted first)
 *   2.png = top-right   (posted second)
 *   3.png = bottom-left (posted third)
 *   4.png = bottom-right (posted fourth)
 */
export async function exportAll(canvases: HTMLCanvasElement[]): Promise<void> {
  for (let i = 0; i < 4; i++) {
    const blob = await canvasToBlob(canvases[i]);
    triggerDownload(blob, `${i + 1}.png`);
    if (i < 3) await delay(300);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
      'image/png'
    );
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
