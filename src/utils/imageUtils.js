/**
 * Resize an image and return compressed WebP Base64 string.
 *
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @param {number} quality
 *
 * @returns {Promise<string>}
 */

export function resizeImage(
  file,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.85,
) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onerror = reject;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Blob creation failed"));
            return;
          }

          resolve(blob);
        },
        "image/webp",
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
