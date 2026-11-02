export const MAX_IMAGE_LENGTH = 64000;

// Resize and re-encode locally: no external upload, original metadata or SVG.
export async function prepareImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Elegí una imagen JPG, PNG o WebP.");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("La imagen debe pesar menos de 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error("No pudimos leer esa imagen. Elegí otro archivo.");
    }
    for (const side of [384, 256, 160]) {
      const scale = Math.min(1, side / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL("image/jpeg", 0.72);
      if (result.length <= MAX_IMAGE_LENGTH) return result;
    }
    throw new Error("No pudimos reducir la imagen. Probá con otra foto.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
