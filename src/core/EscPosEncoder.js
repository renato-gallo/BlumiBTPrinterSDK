import { EpsonProfile } from "../profiles/EpsonProfile.js";
import { CharsetEncoder } from "../encoding/CharsetEncoder.js";
import { ImageProcessor } from "../images/ImageProcessor.js";
import { concatUint8Arrays } from "../utils/utils.js";

/**
 * ESC/POS Byte Command Compiler.
 * Translates formatting operations into a raw binary command stream (Uint8Array)
 * by delegating brand-specific quirks to the active PrinterProfile.
 */
export class EscPosEncoder {
  /**
   * @param {PrinterProfile} [profile] - The active printer hardware profile.
   * @param {Object} [options={}] - Compiler options.
   * @param {boolean} [options.sanitizeSpanish=false] - Normalize Spanish characters to 7-bit ASCII.
   */
  constructor(profile = new EpsonProfile(), options = {}) {
    this.profile = profile;
    this.sanitizeSpanish = options.sanitizeSpanish || false;
  }

  /**
   * Delegates initialization command sequence.
   * @returns {Uint8Array}
   */
  initialize() {
    return this.profile.initialize();
  }

  /**
   * Delegates bold toggling.
   * @param {boolean} enabled
   * @returns {Uint8Array}
   */
  bold(enabled) {
    return this.profile.bold(enabled);
  }

  /**
   * Delegates underline level setting.
   * @param {boolean|number} level - Underline state or line thickness index (0-2).
   * @returns {Uint8Array}
   */
  underline(level) {
    return this.profile.underline(level);
  }

  /**
   * Delegates negative/reverse mode setting.
   * @param {boolean} enabled
   * @returns {Uint8Array}
   */
  reverse(enabled) {
    return this.profile.reverse(enabled);
  }

  /**
   * Delegates 90-degree character rotation setting.
   * @param {boolean} enabled
   * @returns {Uint8Array}
   */
  rotation(enabled) {
    return this.profile.rotation(enabled);
  }

  /**
   * Delegates text alignment setting.
   * @param {string|number} position - 'left', 'center', 'right'.
   * @returns {Uint8Array}
   */
  align(position) {
    return this.profile.align(position);
  }

  /**
   * Delegates character scaling setting.
   * @param {number} width - Horizontal scale (1-8).
   * @param {number} height - Vertical scale (1-8).
   * @returns {Uint8Array}
   */
  fontSize(width, height) {
    return this.profile.fontSize(width, height);
  }

  /**
   * Delegates page feed setting.
   * @param {number} lines - Number of lines.
   * @returns {Uint8Array}
   */
  feed(lines) {
    return this.profile.feed(lines);
  }

  /**
   * Delegates cutting command sequence.
   * @param {boolean} [partial=false] - True for partial cut if supported.
   * @returns {Uint8Array}
   */
  cut(partial = false) {
    return this.profile.cut(partial);
  }

  /**
   * Delegates selection of active printer code table.
   * @param {string} charset
   * @returns {Uint8Array}
   */
  setCodePage(charset) {
    return this.profile.setCodePage(charset);
  }

  /**
   * Compiles text. If charset is 'utf-8' and the profile lacks native support,
   * it falls back to rendering text onto offscreen canvases (raster fallback).
   * 
   * @param {string} string - Plain text.
   * @param {string} [charset='cp850'] - Active character set.
   * @returns {Uint8Array}
   */
  text(string, charset = 'cp850') {
    const processed = this.sanitizeSpanish ? CharsetEncoder.normalizeSpanish(string) : string;
    const target = charset.toLowerCase();
    
    // Check if printer has native UTF-8 support; otherwise, trigger raster fallback
    if (target === 'utf-8' && !this.profile.supportedCodePages['utf-8']) {
      const raster = ImageProcessor.rasterizeText(processed, {
        characterWidth: this.profile.characterWidth
      });
      return this.rasterImage(raster.width, raster.height, raster.data);
    }

    return CharsetEncoder.encode(processed, charset);
  }

  /**
   * Delegates native QR code generation.
   * @param {string} data
   * @param {number} [size=6]
   * @param {string} [ec='M']
   * @returns {Uint8Array}
   */
  qr(data, size = 6, ec = 'M') {
    return this.profile.qr(data, size, ec);
  }

  /**
   * Delegates native 1D barcode generation.
   * @returns {Uint8Array}
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    return this.profile.barcode(type, data, height, width, font, position);
  }

  /**
   * Delegates native 2D PDF417 barcode generation.
   * @returns {Uint8Array}
   */
  pdf417(data, options = {}) {
    return this.profile.pdf417(data, options);
  }

  /**
   * Delegates cash drawer trigger sequence.
   * @returns {Uint8Array}
   */
  cashDrawer(pin = 0) {
    return this.profile.cashDrawer(pin);
  }

  /**
   * Compiles monochrome bitmap into standard GS v 0 raster command.
   * 
   * @param {number} width - Image width (pixels).
   * @param {number} height - Image height (pixels).
   * @param {Uint8Array} bytes - Packed binary data.
   * @returns {Uint8Array}
   */
  rasterImage(width, height, bytes) {
    const widthBytes = width / 8;
    const xL = widthBytes & 0xFF;
    const xH = (widthBytes >> 8) & 0xFF;
    const yL = height & 0xFF;
    const yH = (height >> 8) & 0xFF;

    const header = new Uint8Array([29, 118, 48, 0, xL, xH, yL, yH]);
    return concatUint8Arrays([header, bytes]);
  }
}
