/**
 * Image processing engine for ESC/POS raster conversion.
 * Supports Grayscale, Threshold, Floyd-Steinberg, Atkinson, Ordered Dithering,
 * and text-to-raster UTF-8 fallback rendering.
 */
export class ImageProcessor {
  /**
   * Processes an HTMLImageElement or HTMLCanvasElement into monochrome ESC/POS bits.
   * 
   * @param {HTMLImageElement|HTMLCanvasElement} img - The image/canvas source.
   * @param {Object} [options={}] - Processing options.
   * @param {number} [options.width] - Target width in pixels (multiples of 8).
   * @param {number} [options.threshold=127] - Black/white cutoff value (0-255).
   * @param {string|boolean} [options.dither='floyd-steinberg'] - Dithering type: 'floyd-steinberg', 'atkinson', 'bayer', or false.
   * @returns {{width: number, height: number, data: Uint8Array}} Raster dimensions and packed monochrome bytes.
   */
  static process(img, options = {}) {
    const threshold = options.threshold !== undefined ? options.threshold : 127;
    const dither = options.dither !== undefined ? options.dither : 'floyd-steinberg';
    
    let targetWidth = options.width || img.naturalWidth || img.width;
    targetWidth = Math.ceil(targetWidth / 8) * 8; // Multiple of 8 required by ESC/POS

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
   * Rasterizes canvas pixels into monochrome packed bytes.
   * 
   * @param {HTMLCanvasElement} canvas - Offscreen canvas.
   * @param {number} width - Canvas width.
   * @param {number} height - Canvas height.
   * @param {number} threshold - Threshold cutoff.
   * @param {string|boolean} dither - Dithering algorithm name.
   * @returns {{width: number, height: number, data: Uint8Array}}
   */
  static rasterizeCanvas(canvas, width, height, threshold, dither) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    const size = width * height;
    
    // Create luminance buffer
    const lum = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const idx = i * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      if (a < 128) {
        lum[i] = 255; // transparent is white
      } else {
        // Gray luminance
        lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      }
    }

    const binary = new Uint8Array(size);

    if (dither === 'floyd-steinberg') {
      // Floyd-Steinberg Dithering
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
      // Atkinson Dithering (produces clean whites, high-contrast details)
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
      // Bayer 4x4 Ordered Dithering
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
      // Standard Thresholding (No Dither)
      for (let i = 0; i < size; i++) {
        binary[i] = lum[i] < threshold ? 1 : 0;
      }
    }

    // Pack bits into bytes
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
   * Renders a UTF-8 string onto an offscreen canvas and rasterizes it.
   * This serves as the fallback printing method when printers don't support custom charsets.
   * 
   * @param {string} text - UTF-8 text string to print.
   * @param {Object} [options={}] - Layout and font options.
   * @param {number} [options.characterWidth=48] - Paper width in characters.
   * @param {number} [options.fontSize=24] - Font rendering scale in px.
   * @param {string} [options.fontFamily='monospace'] - Custom system font.
   * @returns {{width: number, height: number, data: Uint8Array}}
   */
  static rasterizeText(text, options = {}) {
    const charWidth = options.characterWidth || 48;
    const pxWidth = charWidth * 8; // Scale to pixel columns (usually 384 or 256)
    const fontSize = options.fontSize || 22;
    const fontFamily = options.fontFamily || 'Courier New, monospace';
    
    const lines = text.split('\n');
    const lineHeight = Math.round(fontSize * 1.3);
    const targetHeight = Math.max(lineHeight, lines.length * lineHeight);

    const canvas = document.createElement('canvas');
    canvas.width = pxWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    // Solid white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pxWidth, targetHeight);

    // Render black text
    ctx.fillStyle = '#000000';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'top';

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 0, i * lineHeight);
    }

    // Rasterize text using clean Thresholding (dithering causes text blur)
    return this.rasterizeCanvas(canvas, pxWidth, targetHeight, 127, false);
  }
}

/**
 * @private
 */
function errorFraction(error, denom) {
  return Math.round(error / denom);
}
