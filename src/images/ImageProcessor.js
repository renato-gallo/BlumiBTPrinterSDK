/**
 * Motor de procesamiento de imágenes para conversión rasterizada ESC/POS.
 * Soporta escala de grises, umbralización, tramado Floyd-Steinberg, Atkinson, tramado ordenado Bayer
 * y renderizado de texto a rasterizado de respaldo para UTF-8.
 */
export class ImageProcessor {
  /**
   * Procesa un HTMLImageElement o HTMLCanvasElement en bytes monocromáticos ESC/POS compactados.
   * 
   * @param {HTMLImageElement|HTMLCanvasElement} img - Elemento de imagen o lienzo de origen.
   * @param {Object} [options={}] - Opciones de procesamiento.
   * @param {number} [options.width] - Ancho de destino en píxeles (múltiplos de 8).
   * @param {number} [options.threshold=127] - Valor de corte para blanco/negro (0-255).
   * @param {string|boolean} [options.dither='floyd-steinberg'] - Algoritmo de tramado: 'floyd-steinberg', 'atkinson', 'bayer', o false.
   * @returns {{width: number, height: number, data: Uint8Array}} Dimensiones de la trama y bytes monocromáticos compactados.
   */
  static process(img, options = {}) {
    const threshold = options.threshold !== undefined ? options.threshold : 127;
    const dither = options.dither !== undefined ? options.dither : 'floyd-steinberg';
    
    let targetWidth = options.width || img.naturalWidth || img.width;
    targetWidth = Math.ceil(targetWidth / 8) * 8; // Múltiplo de 8 requerido por comandos ESC/POS

    const scale = targetWidth / (img.naturalWidth || img.width);
    const targetHeight = Math.round((img.naturalHeight || img.height) * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return this.rasterizeCanvas(canvas, targetWidth, targetHeight, threshold, dither);
  }

  /**
   * Rasteriza los píxeles de un lienzo canvas en bytes compactados monocromáticos.
   * 
   * @param {HTMLCanvasElement} canvas - Lienzo virtual de origen.
   * @param {number} width - Ancho del lienzo.
   * @param {number} height - Alto del lienzo.
   * @param {number} threshold - Valor de corte (umbral).
   * @param {string|boolean} dither - Nombre del algoritmo de tramado.
   * @returns {{width: number, height: number, data: Uint8Array}}
   */
  static rasterizeCanvas(canvas, width, height, threshold, dither) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const size = width * height;
    
    // Crear búfer de luminancia
    const lum = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const idx = i * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      if (a < 128) {
        lum[i] = 255; // El canal transparente se convierte en blanco
      } else {
        // Luminancia de escala de grises estándar
        lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      }
    }

    const binary = new Uint8Array(size);

    if (dither === 'floyd-steinberg') {
      // Tramado Floyd-Steinberg
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          const oldVal = lum[i];
          const newVal = oldVal < threshold ? 0 : 255;
          binary[i] = newVal === 0 ? 1 : 0;
          
          const error = oldVal - newVal;
          
          if (x + 1 < width) lum[i + 1] += error * (7 / 16);
          if (y + 1 < height) {
            if (x - 1 >= 0) lum[i + width - 1] += error * (3 / 16);
            lum[i + width] += error * (5 / 16);
            if (x + 1 < width) lum[i + width + 1] += error * (1 / 16);
          }
        }
      }
    } else if (dither === 'atkinson') {
      // Tramado Atkinson (produce blancos limpios y detalles de alto contraste)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          const oldVal = lum[i];
          const newVal = oldVal < threshold ? 0 : 255;
          binary[i] = newVal === 0 ? 1 : 0;
          
          const error = errorFraction(oldVal - newVal, 8);
          
          if (x + 1 < width) lum[i + 1] += error;
          if (x + 2 < width) lum[i + 2] += error;
          if (y + 1 < height) {
            if (x - 1 >= 0) lum[i + width - 1] += error;
            lum[i + width] += error;
            if (x + 1 < width) lum[i + width + 1] += error;
          }
          if (y + 2 < height) {
            lum[i + (width * 2)] += error;
          }
        }
      }
    } else if (dither === 'bayer' || dither === 'ordered') {
      // Tramado ordenado Bayer de 4x4
      const matrix = [
        [  0,  8,  2, 10 ],
        [ 12,  4, 14,  6 ],
        [  3, 11,  1,  9 ],
        [ 15,  7, 13,  5 ]
      ];
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = y * width + x;
          const matVal = matrix[y % 4][x % 4];
          const limit = (matVal + 0.5) * 16 - 1;
          binary[i] = lum[i] < limit ? 1 : 0;
        }
      }
    } else {
      // Umbralización estándar (Sin tramado)
      for (let i = 0; i < size; i++) {
        binary[i] = lum[i] < threshold ? 1 : 0;
      }
    }

    // Compactar bits en bytes de destino
    const widthBytes = width / 8;
    const rasterBytes = new Uint8Array(widthBytes * height);

    for (let y = 0; y < height; y++) {
      for (let xb = 0; xb < widthBytes; xb++) {
        let byteVal = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = xb * 8 + bit;
          if (binary[y * width + x]) {
            byteVal |= (1 << (7 - bit));
          }
        }
        rasterBytes[y * widthBytes + xb] = byteVal;
      }
    }

    return {
      width,
      height,
      data: rasterBytes
    };
  }

  /**
   * Renderiza una cadena de texto UTF-8 sobre un canvas virtual y luego lo rasteriza.
   * Sirve como método de respaldo para imprimir cuando la impresora no tiene tablas de caracteres nativas adecuadas.
   * 
   * @param {string} text - Cadena de texto UTF-8 a imprimir.
   * @param {Object} [options={}] - Opciones de diseño y fuente.
   * @param {number} [options.characterWidth=48] - Ancho del papel en número de caracteres.
   * @param {number} [options.fontSize=24] - Tamaño de escala de fuente en px.
   * @param {string} [options.fontFamily='monospace'] - Fuente del sistema de renderizado.
   * @returns {{width: number, height: number, data: Uint8Array}}
   */
  static rasterizeText(text, options = {}) {
    const charWidth = options.characterWidth || 48;
    const pxWidth = charWidth * 8; // Escala a columnas de píxeles (normalmente 384 o 256)
    const fontSize = options.fontSize || 22;
    const fontFamily = options.fontFamily || 'Courier New, monospace';
    
    const lines = text.split('\n');
    const lineHeight = Math.round(fontSize * 1.3);
    const targetHeight = Math.max(lineHeight, lines.length * lineHeight);

    const canvas = document.createElement('canvas');
    canvas.width = pxWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Fondo blanco sólido
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pxWidth, targetHeight);

    // Renderizar texto en negro
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 0, i * lineHeight);
    }

    // Rasterizar texto usando umbralización limpia (el tramado emborrona el texto pequeño)
    return this.rasterizeCanvas(canvas, pxWidth, targetHeight, 127, false);
  }
}

/**
 * @private
 */
function errorFraction(error, denom) {
  return Math.round(error / denom);
}
