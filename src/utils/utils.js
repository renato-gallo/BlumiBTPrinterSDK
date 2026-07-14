/**
 * Concatenates multiple Uint8Array buffers into a single Uint8Array.
 * 
 * @param {Uint8Array[]} arrays - Array of Uint8Arrays to concatenate.
 * @returns {Uint8Array} The combined byte array.
 */
export function concatUint8Arrays(arrays) {
  let totalLength = 0;
  for (const arr of arrays) {
    if (arr) totalLength += arr.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    if (arr) {
      result.set(arr, offset);
      offset += arr.length;
    }
  }
  return result;
}

/**
 * Dynamically loads an image from a URL, Blob, File, or HTMLImageElement.
 * 
 * @param {string|Blob|File|HTMLImageElement} src - The source of the image.
 * @returns {Promise<HTMLImageElement>} A promise resolving to the loaded HTMLImageElement.
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (src instanceof HTMLImageElement) {
      if (src.complete) {
        resolve(src);
      } else {
        src.onload = () => resolve(src);
        src.onerror = (err) => reject(err);
      }
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous'; // Prevent tainted canvas for external URLs

    img.onload = () => {
      if (src instanceof Blob) {
        URL.revokeObjectURL(img.src);
      }
      resolve(img);
    };

    img.onerror = (err) => {
      if (src instanceof Blob) {
        URL.revokeObjectURL(img.src);
      }
      reject(new Error("Failed to load image source."));
    };

    if (src instanceof Blob) {
      img.src = URL.createObjectURL(src);
    } else if (typeof src === 'string') {
      img.src = src;
    } else {
      reject(new Error("Unsupported image source type."));
    }
  });
}
