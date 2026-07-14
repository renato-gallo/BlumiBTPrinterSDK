/**
 * Concatena múltiples búferes de tipo Uint8Array en un único Uint8Array continuo.
 * 
 * @param {Uint8Array[]} arrays - Arreglo de instancias de Uint8Array a concatenar.
 * @returns {Uint8Array} El arreglo de bytes combinado resultante.
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
 * Carga dinámicamente una imagen a partir de una URL, Blob, File o HTMLImageElement.
 * 
 * @param {string|Blob|File|HTMLImageElement} src - El origen de la imagen a cargar.
 * @returns {Promise<HTMLImageElement>} Promesa que resuelve al elemento HTMLImageElement cargado.
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
    img.crossOrigin = 'anonymous'; // Previene bloqueos CORS en el canvas para URLs externas

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
      reject(new Error("No se pudo cargar el origen de la imagen."));
    };

    if (src instanceof Blob) {
      img.src = URL.createObjectURL(src);
    } else if (typeof src === 'string') {
      img.src = src;
    } else {
      reject(new Error("Tipo de origen de imagen no soportado."));
    }
  });
}
