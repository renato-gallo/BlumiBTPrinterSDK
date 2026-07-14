import { EscPosEncoder } from "../core/EscPosEncoder.js";
import { concatUint8Arrays, loadImage } from "../utils/utils.js";
import { ImageProcessor } from "../images/ImageProcessor.js";

/**
 * Constructor de Plantilla de Boleta/Ticket Base.
 * Expone métodos encadenables de diseño y diagramación de comprobantes de impresión.
 */
export class TicketBuilder {
  /**
   * @param {Object} [options={}] - Parámetros de configuración.
   * @param {number} [options.characterWidth=48] - Límite de caracteres por columna.
   * @param {string} [options.charset='cp850'] - Tabla de caracteres activa.
   * @param {EscPosEncoder} [options.encoder] - Instancia predefinida del compilador de comandos.
   */
  constructor(options = {}) {
    this.characterWidth = options.characterWidth || 48;
    this.charset = options.charset || 'cp850';
    this.encoder = options.encoder || new EscPosEncoder();
    this.buffers = [];

    // Anteponer inicialización por defecto
    this.buffers.push(this.encoder.initialize());
    this.buffers.push(this.encoder.setCodePage(this.charset));
  }

  /**
   * Añade una línea de texto plano finalizada con un salto de línea.
   * @param {string} string - Texto plano.
   * @returns {TicketBuilder}
   */
  text(string) {
    const lineStr = string.endsWith('\n') ? string : string + '\n';
    this.buffers.push(this.encoder.text(lineStr, this.charset));
    return this;
  }

  /**
   * Alterna la impresión de texto en negrita.
   * @param {boolean} [enabled=true]
   * @returns {TicketBuilder}
   */
  bold(enabled = true) {
    this.buffers.push(this.encoder.bold(enabled));
    return this;
  }

  /**
   * Alterna la decoración de subrayado.
   * @param {boolean|number} [level=true]
   * @returns {TicketBuilder}
   */
  underline(level = true) {
    this.buffers.push(this.encoder.underline(level));
    return this;
  }

  /**
   * Alterna la impresión en modo inverso (blanco sobre negro).
   * @param {boolean} [enabled=true]
   * @returns {TicketBuilder}
   */
  reverse(enabled = true) {
    this.buffers.push(this.encoder.reverse(enabled));
    return this;
  }

  /**
   * Alterna la rotación de caracteres en 90 grados.
   * @param {boolean} [enabled=true]
   * @returns {TicketBuilder}
   */
  rotation(enabled = true) {
    this.buffers.push(this.encoder.rotation(enabled));
    return this;
  }

  /**
   * Establece la alineación del texto.
   * @param {string|number} pos - 'left', 'center', 'right'.
   * @returns {TicketBuilder}
   */
  align(pos) {
    this.buffers.push(this.encoder.align(pos));
    return this;
  }

  /**
   * Centra la alineación.
   * @returns {TicketBuilder}
   */
  center() {
    return this.align('center');
  }

  /**
   * Alinea a la izquierda.
   * @returns {TicketBuilder}
   */
  left() {
    return this.align('left');
  }

  /**
   * Alinea a la derecha.
   * @returns {TicketBuilder}
   */
  right() {
    return this.align('right');
  }

  /**
   * Modifica la escala de tamaño de la fuente.
   * @param {number} width - Multiplicador horizontal (1-8).
   * @param {number} height - Multiplicador vertical (1-8).
   * @returns {TicketBuilder}
   */
  size(width, height) {
    this.buffers.push(this.encoder.fontSize(width, height));
    return this;
  }

  /**
   * Añade una línea horizontal de separación de caracteres.
   * @param {string} [char='-']
   * @returns {TicketBuilder}
   */
  line(char = '-') {
    const separator = char[0].repeat(this.characterWidth) + '\n';
    this.buffers.push(this.encoder.text(separator, this.charset));
    return this;
  }

  /**
   * Imprime una fila con dos columnas alineadas a los extremos izquierdo/derecho.
   * @param {string} left - Contenido izquierdo.
   * @param {string} right - Contenido derecho.
   * @returns {TicketBuilder}
   */
  row(left, right) {
    const leftStr = String(left);
    const rightStr = String(right);
    const spaces = this.characterWidth - leftStr.length - rightStr.length;

    let rowStr = '';
    if (spaces > 0) {
      rowStr = leftStr + ' '.repeat(spaces) + rightStr + '\n';
    } else {
      const maxLeft = Math.max(0, this.characterWidth - rightStr.length - 1);
      rowStr = leftStr.substring(0, maxLeft) + ' ' + rightStr + '\n';
    }

    this.buffers.push(this.encoder.text(rowStr, this.charset));
    return this;
  }

  /**
   * Destaca totales de la boleta rodeándolos de líneas dobles.
   * @param {string} value - Monto total formateado.
   * @returns {TicketBuilder}
   */
  total(value) {
    this.line('=');
    this.bold(true);
    this.row("TOTAL", value);
    this.bold(false);
    this.line('=');
    return this;
  }

  /**
   * Añade un código QR centrado de forma nativa.
   * @param {string} url - Contenido del QR.
   * @param {number} [size=6] - Escala.
   * @param {string} [ec='M'] - Nivel de corrección de errores (L, M, Q, H).
   * @returns {TicketBuilder}
   */
  qr(url, size = 6, ec = 'M') {
    this.center();
    this.buffers.push(this.encoder.qr(url, size, ec));
    this.feed(1);
    this.left();
    return this;
  }

  /**
   * Añade un código de barras 1D nativo.
   * @returns {TicketBuilder}
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    this.buffers.push(this.encoder.barcode(type, data, height, width, font, position));
    return this;
  }

  /**
   * Añade un código de barras 2D PDF417 nativo.
   * @returns {TicketBuilder}
   */
  pdf417(data, options = {}) {
    this.buffers.push(this.encoder.pdf417(data, options));
    return this;
  }

  /**
   * Envía la señal de apertura de cajón portamonedas.
   * @param {number} [pin=0]
   * @returns {TicketBuilder}
   */
  cashDrawer(pin = 0) {
    this.buffers.push(this.encoder.cashDrawer(pin));
    return this;
  }

  /**
   * Rasteriza e inserta una imagen en comandos raster (asíncrono).
   * 
   * @param {string|Blob|File|HTMLImageElement} src
   * @param {Object} [options={}]
   * @returns {Promise<TicketBuilder>}
   */
  async image(src, options = {}) {
    try {
      const img = await loadImage(src);
      const align = options.align || 'center';
      
      this.align(align);

      const defaultWidth = this.characterWidth === 32 ? 256 : 384;
      const targetWidth = options.width || defaultWidth;

      const raster = ImageProcessor.process(img, {
        width: targetWidth,
        threshold: options.threshold,
        dither: options.dither !== undefined ? options.dither : 'floyd-steinberg'
      });

      this.buffers.push(this.encoder.rasterImage(raster.width, raster.height, raster.data));
      this.feed(1);
      this.left();
    } catch (err) {
      console.error("[TicketBuilder] Falló la renderización de la imagen:", err);
    }
    return this;
  }

  /**
   * Avanza el papel por líneas.
   * @param {number} [lines=1]
   * @returns {TicketBuilder}
   */
  feed(lines = 1) {
    this.buffers.push(this.encoder.feed(lines));
    return this;
  }

  /**
   * Realiza un corte físico de papel.
   * @param {boolean} [partial=false]
   * @returns {TicketBuilder}
   */
  cut(partial = false) {
    this.buffers.push(this.encoder.cut(partial));
    return this;
  }

  /**
   * Compila los búferes y retorna la secuencia binaria completa.
   * @returns {Uint8Array}
   */
  build() {
    return concatUint8Arrays(this.buffers);
  }
}
