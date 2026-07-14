import { concatUint8Arrays } from "../utils/utils.js";
import { CharsetEncoder } from "../encoding/CharsetEncoder.js";

/**
 * Base Printer Profile. Defines default ESC/POS commands.
 * Specific vendor overrides must extend this class.
 */
export class PrinterProfile {
  constructor() {
    this.name = "Generic ESC/POS";
    this.characterWidth = 48; // Default to 80mm standard (48 chars in Font A)
    
    // Mapping of standard character sets to printer ESC t codes
    this.supportedCodePages = {
      'cp437': 0,
      'cp850': 2,
      'cp860': 3,
      'cp863': 4,
      'cp865': 5,
      'cp1252': 16,
      'cp866': 17,
      'cp852': 18,
      'cp858': 19,
      'iso8859-1': 15,
      'iso8859-15': 37,
      'cp1250': 72,
      'cp1251': 73,
      'gb18030': 255
    };
  }

  /**
   * ESC @ - Initialize printer
   */
  initialize() {
    return new Uint8Array([27, 64]);
  }

  /**
   * ESC E n - Bold text
   */
  bold(enabled) {
    return new Uint8Array([27, 69, enabled ? 1 : 0]);
  }

  /**
   * ESC - n - Underline text (0: Off, 1: 1-dot, 2: 2-dot)
   */
  underline(level) {
    const val = typeof level === 'boolean' ? (level ? 1 : 0) : Math.max(0, Math.min(2, level));
    return new Uint8Array([27, 45, val]);
  }

  /**
   * GS B n - Reverse white/black printing mode
   */
  reverse(enabled) {
    return new Uint8Array([29, 66, enabled ? 1 : 0]);
  }

  /**
   * ESC V n - Rotate text 90 degrees (0: Off, 1: On)
   */
  rotation(enabled) {
    return new Uint8Array([27, 86, enabled ? 1 : 0]);
  }

  /**
   * ESC a n - Set alignment
   */
  align(position) {
    const alignMap = { 'left': 0, 'center': 1, 'right': 2, 0: 0, 1: 1, 2: 2 };
    const val = alignMap[position] !== undefined ? alignMap[position] : 0;
    return new Uint8Array([27, 97, val]);
  }

  /**
   * GS ! n - Set font size (multipliers 1 to 8)
   */
  fontSize(width = 1, height = 1) {
    const w = Math.max(1, Math.min(8, width)) - 1;
    const h = Math.max(1, Math.min(8, height)) - 1;
    const n = (w << 4) | h;
    return new Uint8Array([29, 33, n]);
  }

  /**
   * ESC d n - Feed paper by n lines
   */
  feed(lines = 1) {
    const n = Math.max(1, Math.min(255, lines));
    return new Uint8Array([27, 100, n]);
  }

  /**
   * GS V A n - Cut paper (partial or full)
   */
  cut(partial = false) {
    // 65: Full cut, 66: Partial cut (standard GS V A m commands)
    const m = partial ? 66 : 65;
    return new Uint8Array([29, 86, m, 0]);
  }

  /**
   * ESC t n - Select code table
   */
  setCodePage(charset) {
    const code = this.supportedCodePages[charset.toLowerCase()];
    if (code === undefined) {
      console.warn(`Charset ${charset} not supported natively by this profile. Defaulting to CP850.`);
      return new Uint8Array([27, 116, 2]); // fallback to CP850
    }
    return new Uint8Array([27, 116, code]);
  }

  /**
   * ESC p m t1 t2 - Kick cash drawer (0: Pin 2, 1: Pin 5)
   */
  cashDrawer(pin = 0) {
    const m = pin === 1 ? 1 : 0;
    return new Uint8Array([27, 112, m, 25, 250]);
  }

  /**
   * GS ( k - Native QR Code printing (Model 2)
   */
  qr(data, size = 6, errorCorrection = 'M') {
    const dataBytes = CharsetEncoder.encode(data, 'cp850');
    const numBytes = dataBytes.length + 3;
    const pL = numBytes & 0xFF;
    const pH = (numBytes >> 8) & 0xFF;

    const modelCmd = new Uint8Array([29, 40, 107, 4, 0, 49, 65, 50, 0]);
    const sizeCmd = new Uint8Array([29, 40, 107, 3, 0, 49, 67, Math.max(1, Math.min(16, size))]);

    const ecMap = { 'L': 48, 'M': 49, 'Q': 50, 'H': 51 };
    const ecCode = ecMap[errorCorrection.toUpperCase()] || 49;
    const ecCmd = new Uint8Array([29, 40, 107, 3, 0, 49, 69, ecCode]);

    const storeHeader = new Uint8Array([29, 40, 107, pL, pH, 49, 80, 48]);
    const storeCmd = concatUint8Arrays([storeHeader, dataBytes]);

    const printCmd = new Uint8Array([29, 40, 107, 3, 0, 49, 81, 48]);

    return concatUint8Arrays([modelCmd, sizeCmd, ecCmd, storeCmd, printCmd]);
  }

  /**
   * GS k m n d1...dn - Print 1D Barcode (Format B)
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    const typeMap = {
      'upc-a': 65,
      'upc-e': 66,
      'ean13': 67,
      'ean8': 68,
      'code39': 69,
      'itf': 70,
      'codabar': 71,
      'code93': 72,
      'code128': 73
    };

    const system = typeMap[type.toLowerCase()];
    if (system === undefined) {
      throw new Error(`Barcode type '${type}' is not supported by standard ESC/POS.`);
    }

    let dataBytes = CharsetEncoder.encode(data, 'cp850');
    
    // Code128 requires charset identifier prefix. Default to Subset B '{B'
    if (system === 73) {
      const hasSubsetPrefix = data.startsWith('{A') || data.startsWith('{B') || data.startsWith('{C');
      if (!hasSubsetPrefix) {
        const prefix = new Uint8Array([123, 66]); // '{B' in ASCII
        dataBytes = concatUint8Arrays([prefix, dataBytes]);
      }
    }

    // Dimension commands
    const heightCmd = new Uint8Array([29, 104, Math.max(1, Math.min(255, height))]);
    const widthCmd = new Uint8Array([29, 119, Math.max(2, Math.min(6, width))]);
    const fontCmd = new Uint8Array([29, 102, font === 1 ? 1 : 0]);
    const posCmd = new Uint8Array([29, 72, Math.max(0, Math.min(3, position))]);

    // Format 2 Barcode print command: GS k m n d1...dn
    const header = new Uint8Array([29, 107, system, dataBytes.length]);
    const printCmd = concatUint8Arrays([header, dataBytes]);

    return concatUint8Arrays([heightCmd, widthCmd, fontCmd, posCmd, printCmd]);
  }

  /**
   * GS ( k - Native PDF417 (Standard ESC/POS Function Group)
   */
  pdf417(data, options = {}) {
    const cols = options.columns || 0; // 0: Auto
    const rows = options.rows || 0;       // 0: Auto
    const width = options.width || 3;    // Module width
    const height = options.height || 3;  // Module height ratio
    const errorLevel = options.errorLevel || 1;

    const dataBytes = CharsetEncoder.encode(data, 'cp850');
    const numBytes = dataBytes.length + 3;
    const pL = numBytes & 0xFF;
    const pH = (numBytes >> 8) & 0xFF;

    // Set Columns (fn 041)
    const colsCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 65, cols]);
    // Set Rows (fn 042)
    const rowsCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 66, rows]);
    // Set Width (fn 043)
    const widthCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 67, width]);
    // Set Height (fn 044)
    const heightCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 68, height]);
    // Set Error Correction (fn 045)
    const errCmd = new Uint8Array([29, 40, 107, 4, 0, 48, 69, 48, errorLevel]);

    // Store PDF417 data (fn 080)
    const storeHeader = new Uint8Array([29, 40, 107, pL, pH, 48, 80, 48]);
    const storeCmd = concatUint8Arrays([storeHeader, dataBytes]);

    // Print PDF417 symbol (fn 081)
    const printCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 81, 48]);

    return concatUint8Arrays([colsCmd, rowsCmd, widthCmd, heightCmd, errCmd, storeCmd, printCmd]);
  }
}
