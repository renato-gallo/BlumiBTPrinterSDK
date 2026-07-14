import { concatUint8Arrays } from "../utils/utils.js";
import { CharsetEncoder } from "../encoding/CharsetEncoder.js";

/**
 * Perfil de Impresora Base. Define los comandos ESC/POS por defecto.
 * Las anulaciones y adaptaciones específicas de fabricantes deben extender esta clase.
 */
export class PrinterProfile {
  constructor() {
    this.name = "Generic ESC/POS";
    this.characterWidth = 48; // Por defecto para estándar de 80mm (48 caracteres en Fuente A)
    
    // Mapeo de tablas de caracteres estándar a códigos numéricos ESC t de la impresora
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
   * ESC @ - Inicializa la impresora.
   */
  initialize() {
    return new Uint8Array([27, 64]);
  }

  /**
   * ESC E n - Habilita/Deshabilita texto en negrita.
   */
  bold(enabled) {
    return new Uint8Array([27, 69, enabled ? 1 : 0]);
  }

  /**
   * ESC - n - Habilita subrayado (0: Apagado, 1: 1 punto, 2: 2 puntos).
   */
  underline(level) {
    const val = typeof level === 'boolean' ? (level ? 1 : 0) : Math.max(0, Math.min(2, level));
    return new Uint8Array([27, 45, val]);
  }

  /**
   * GS B n - Habilita/Deshabilita el modo de impresión inversa (blanco sobre negro).
   */
  reverse(enabled) {
    return new Uint8Array([29, 66, enabled ? 1 : 0]);
  }

  /**
   * ESC V n - Rota el texto 90 grados (0: Apagado, 1: Encendido).
   */
  rotation(enabled) {
    return new Uint8Array([27, 86, enabled ? 1 : 0]);
  }

  /**
   * ESC a n - Establece la alineación del texto.
   */
  align(position) {
    const alignMap = { 'left': 0, 'center': 1, 'right': 2, 0: 0, 1: 1, 2: 2 };
    const val = alignMap[position] !== undefined ? alignMap[position] : 0;
    return new Uint8Array([27, 97, val]);
  }

  /**
   * GS ! n - Establece el tamaño de la fuente (multiplicadores de 1 a 8).
   */
  fontSize(width = 1, height = 1) {
    const w = Math.max(1, Math.min(8, width)) - 1;
    const h = Math.max(1, Math.min(8, height)) - 1;
    const n = (w << 4) | h;
    return new Uint8Array([29, 33, n]);
  }

  /**
   * ESC d n - Alimenta el papel n líneas.
   */
  feed(lines = 1) {
    const n = Math.max(1, Math.min(255, lines));
    return new Uint8Array([27, 100, n]);
  }

  /**
   * GS V A n - Corta el papel (parcial o total).
   */
  cut(partial = false) {
    // 65: Corte completo, 66: Corte parcial (comandos estándar GS V A m)
    const m = partial ? 66 : 65;
    return new Uint8Array([29, 86, m, 0]);
  }

  /**
   * ESC t n - Selecciona la tabla de caracteres.
   */
  setCodePage(charset) {
    const code = this.supportedCodePages[charset.toLowerCase()];
    if (code === undefined) {
      console.warn(`La codificación ${charset} no está soportada nativamente por este perfil. Usando CP850 por defecto.`);
      return new Uint8Array([27, 116, 2]); // respaldo a CP850
    }
    return new Uint8Array([27, 116, code]);
  }

  /**
   * ESC p m t1 t2 - Abre el cajón portamonedas (0: Pin 2, 1: Pin 5).
   */
  cashDrawer(pin = 0) {
    const m = pin === 1 ? 1 : 0;
    return new Uint8Array([27, 112, m, 25, 250]);
  }

  /**
   * GS ( k - Impresión nativa de Código QR (Modelo 2).
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
   * GS k m n d1...dn - Imprime un código de barras 1D (Formato B).
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
      throw new Error(`El tipo de código de barras '${type}' no está soportado por el estándar ESC/POS.`);
    }

    let dataBytes = CharsetEncoder.encode(data, 'cp850');
    
    // Code128 requiere el prefijo identificador de subconjunto. Por defecto Subconjunto B '{B'
    if (system === 73) {
      const hasSubsetPrefix = data.startsWith('{A') || data.startsWith('{B') || data.startsWith('{C');
      if (!hasSubsetPrefix) {
        const prefix = new Uint8Array([123, 66]); // '{B' en ASCII
        dataBytes = concatUint8Arrays([prefix, dataBytes]);
      }
    }

    // Comandos de dimensionamiento
    const heightCmd = new Uint8Array([29, 104, Math.max(1, Math.min(255, height))]);
    const widthCmd = new Uint8Array([29, 119, Math.max(2, Math.min(6, width))]);
    const fontCmd = new Uint8Array([29, 102, font === 1 ? 1 : 0]);
    const posCmd = new Uint8Array([29, 72, Math.max(0, Math.min(3, position))]);

    // Comando de impresión de formato 2: GS k m n d1...dn
    const header = new Uint8Array([29, 107, system, dataBytes.length]);
    const printCmd = concatUint8Arrays([header, dataBytes]);

    return concatUint8Arrays([heightCmd, widthCmd, fontCmd, posCmd, printCmd]);
  }

  /**
   * GS ( k - PDF417 Nativo (Grupo de funciones estándar ESC/POS).
   */
  pdf417(data, options = {}) {
    const cols = options.columns || 0; // 0: Auto
    const rows = options.rows || 0;       // 0: Auto
    const width = options.width || 3;    // Ancho de módulo
    const height = options.height || 3;  // Relación de alto de módulo
    const errorLevel = options.errorLevel || 1;

    const dataBytes = CharsetEncoder.encode(data, 'cp850');
    const numBytes = dataBytes.length + 3;
    const pL = numBytes & 0xFF;
    const pH = (numBytes >> 8) & 0xFF;

    // Ajustar columnas (fn 041)
    const colsCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 65, cols]);
    // Ajustar filas (fn 042)
    const rowsCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 66, rows]);
    // Ajustar ancho (fn 043)
    const widthCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 67, width]);
    // Ajustar alto (fn 044)
    const heightCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 68, height]);
    // Ajustar nivel de corrección de errores (fn 045)
    const errCmd = new Uint8Array([29, 40, 107, 4, 0, 48, 69, 48, errorLevel]);

    // Guardar datos PDF417 (fn 080)
    const storeHeader = new Uint8Array([29, 40, 107, pL, pH, 48, 80, 48]);
    const storeCmd = concatUint8Arrays([storeHeader, dataBytes]);

    // Imprimir símbolo PDF417 (fn 081)
    const printCmd = new Uint8Array([29, 40, 107, 3, 0, 48, 81, 48]);

    return concatUint8Arrays([colsCmd, rowsCmd, widthCmd, heightCmd, errCmd, storeCmd, printCmd]);
  }
}
