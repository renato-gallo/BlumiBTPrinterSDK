import { EpsonProfile } from "../profiles/EpsonProfile.js";
import { CharsetEncoder } from "../encoding/CharsetEncoder.js";
import { ImageProcessor } from "../images/ImageProcessor.js";
import { concatUint8Arrays } from "../utils/utils.js";

/**
 * Compilador de Comandos en Bytes ESC/POS.
 * Traduce operaciones de formato en un flujo de comandos binarios (Uint8Array)
 * delegando las particularidades de marcas de impresoras al PrinterProfile activo.
 */
export class EscPosEncoder {
  /**
   * @param {PrinterProfile} [profile] - Perfil de hardware de la impresora activa.
   * @param {Object} [options={}] - Opciones de compilación.
   * @param {boolean} [options.sanitizeSpanish=false] - Normaliza caracteres del español a ASCII de 7 bits.
   */
  constructor(profile = new EpsonProfile(), options = {}) {
    this.profile = profile;
    this.sanitizeSpanish = options.sanitizeSpanish || false;
  }

  /**
   * Delega la secuencia de comandos de inicialización de la impresora.
   * @returns {Uint8Array}
   */
  initialize() {
    return this.profile.initialize();
  }

  /**
   * Delega la activación/desactivación del modo negrita.
   * @param {boolean} enabled
   * @returns {Uint8Array}
   */
  bold(enabled) {
    return this.profile.bold(enabled);
  }

  /**
   * Delega el ajuste del nivel de subrayado.
   * @param {boolean|number} level - Estado o grosor de la línea (0-2).
   * @returns {Uint8Array}
   */
  underline(level) {
    return this.profile.underline(level);
  }

  /**
   * Delega la activación/desactivación del modo inverso (blanco sobre negro).
   * @param {boolean} enabled
   * @returns {Uint8Array}
   */
  reverse(enabled) {
    return this.profile.reverse(enabled);
  }

  /**
   * Delega la rotación del texto en 90 grados.
   * @param {boolean} enabled
   * @returns {Uint8Array}
   */
  rotation(enabled) {
    return this.profile.rotation(enabled);
  }

  /**
   * Delega la alineación del texto.
   * @param {string|number} position - 'left', 'center', 'right'.
   * @returns {Uint8Array}
   */
  align(position) {
    return this.profile.align(position);
  }

  /**
   * Delega la escala de tamaño de fuente.
   * @param {number} width - Escala horizontal (1-8).
   * @param {number} height - Escala vertical (1-8).
   * @returns {Uint8Array}
   */
  fontSize(width, height) {
    return this.profile.fontSize(width, height);
  }

  /**
   * Delega el avance de papel por líneas.
   * @param {number} lines - Número de líneas.
   * @returns {Uint8Array}
   */
  feed(lines) {
    return this.profile.feed(lines);
  }

  /**
   * Delega la secuencia de comandos de corte.
   * @param {boolean} [partial=false] - True para realizar un corte parcial si está soportado.
   * @returns {Uint8Array}
   */
  cut(partial = false) {
    return this.profile.cut(partial);
  }

  /**
   * Delega la selección de la tabla de caracteres activa en la impresora.
   * @param {string} charset
   * @returns {Uint8Array}
   */
  setCodePage(charset) {
    return this.profile.setCodePage(charset);
  }

  /**
   * Compila el texto. Si la codificación es 'utf-8' y el perfil carece de soporte nativo,
   * utiliza el renderizado de texto mediante lienzo virtual (respaldo rasterizado).
   * 
   * @param {string} string - Texto plano.
   * @param {string} [charset='cp850'] - Tabla de caracteres activa.
   * @returns {Uint8Array}
   */
  text(string, charset = 'cp850') {
    const processed = this.sanitizeSpanish ? CharsetEncoder.normalizeSpanish(string) : string;
    const target = charset.toLowerCase();
    
    // Si la impresora no soporta UTF-8 nativo, activa el respaldo rasterizado
    if (target === 'utf-8' && !this.profile.supportedCodePages['utf-8']) {
      const raster = ImageProcessor.rasterizeText(processed, {
        characterWidth: this.profile.characterWidth
      });
      return this.rasterImage(raster.width, raster.height, raster.data);
    }

    return CharsetEncoder.encode(processed, charset);
  }

  /**
   * Delega la generación del código QR nativo.
   * @param {string} data
   * @param {number} [size=6]
   * @param {string} [ec='M']
   * @returns {Uint8Array}
   */
  qr(data, size = 6, ec = 'M') {
    return this.profile.qr(data, size, ec);
  }

  /**
   * Delega la generación de código de barras 1D nativo.
   * @returns {Uint8Array}
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    return this.profile.barcode(type, data, height, width, font, position);
  }

  /**
   * Delega la generación de código de barras PDF417 nativo de 2D.
   * @returns {Uint8Array}
   */
  pdf417(data, options = {}) {
    return this.profile.pdf417(data, options);
  }

  /**
   * Delega la secuencia de apertura del cajón portamonedas.
   * @returns {Uint8Array}
   */
  cashDrawer(pin = 0) {
    return this.profile.cashDrawer(pin);
  }

  /**
   * Compila una imagen de mapa de bits monocromática en comandos raster estándar GS v 0.
   * 
   * @param {number} width - Ancho de la imagen (píxeles).
   * @param {number} height - Alto de la imagen (píxeles).
   * @param {Uint8Array} bytes - Datos binarios compactados.
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
