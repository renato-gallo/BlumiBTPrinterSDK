import { EscPosEncoder } from "../core/EscPosEncoder.js";
import { concatUint8Arrays, loadImage } from "../utils/utils.js";
import { ImageProcessor } from "../images/ImageProcessor.js";

/**
 * Base Ticket/Receipt Builder.
 * Exposes chainable design layout methods compiling into a single ESC/POS Uint8Array.
 */
export class TicketBuilder {
  /**
   * @param {Object} [options={}] - Config parameters.
   * @param {number} [options.characterWidth=48] - Column characters limit.
   * @param {string} [options.charset='cp850'] - Active code page.
   * @param {EscPosEncoder} [options.encoder] - Pre-instantiated command encoder.
   */
  constructor(options = {}) {
    this.characterWidth = options.characterWidth || 48;
    this.charset = options.charset || 'cp850';
    this.encoder = options.encoder || new EscPosEncoder();
    this.buffers = [];

    // Prepend default initialization
    this.buffers.push(this.encoder.initialize());
    this.buffers.push(this.encoder.setCodePage(this.charset));
  }

  /**
   * Appends text with a trailing newline.
   * @param {string} string
   * @returns {TicketBuilder}
   */
  text(string) {
    const lineStr = string.endsWith('\n') ? string : string + '\n';
    this.buffers.push(this.encoder.text(lineStr, this.charset));
    return this;
  }

  /**
   * Toggles bold mode.
   * @param {boolean} [enabled=true]
   * @returns {TicketBuilder}
   */
  bold(enabled = true) {
    this.buffers.push(this.encoder.bold(enabled));
    return this;
  }

  /**
   * Toggles underline decoration.
   * @param {boolean|number} [level=true]
   * @returns {TicketBuilder}
   */
  underline(level = true) {
    this.buffers.push(this.encoder.underline(level));
    return this;
  }

  /**
   * Toggles negative print mode.
   * @param {boolean} [enabled=true]
   * @returns {TicketBuilder}
   */
  reverse(enabled = true) {
    this.buffers.push(this.encoder.reverse(enabled));
    return this;
  }

  /**
   * Toggles 90-degree character rotation.
   * @param {boolean} [enabled=true]
   * @returns {TicketBuilder}
   */
  rotation(enabled = true) {
    this.buffers.push(this.encoder.rotation(enabled));
    return this;
  }

  /**
   * Sets text alignment.
   * @param {string|number} pos - 'left', 'center', 'right'.
   * @returns {TicketBuilder}
   */
  align(pos) {
    this.buffers.push(this.encoder.align(pos));
    return this;
  }

  /**
   * Centers text.
   * @returns {TicketBuilder}
   */
  center() {
    return this.align('center');
  }

  /**
   * Left-aligns text.
   * @returns {TicketBuilder}
   */
  left() {
    return this.align('left');
  }

  /**
   * Right-aligns text.
   * @returns {TicketBuilder}
   */
  right() {
    return this.align('right');
  }

  /**
   * Modifies font size multipliers.
   * @param {number} width
   * @param {number} height
   * @returns {TicketBuilder}
   */
  size(width, height) {
    this.buffers.push(this.encoder.fontSize(width, height));
    return this;
  }

  /**
   * Appends separator line.
   * @param {string} [char='-']
   * @returns {TicketBuilder}
   */
  line(char = '-') {
    const separator = char[0].repeat(this.characterWidth) + '\n';
    this.buffers.push(this.encoder.text(separator, this.charset));
    return this;
  }

  /**
   * Prints double-column key/value row.
   * @param {string} left
   * @param {string} right
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
   * Highlights totals with double separator lines.
   * @param {string} value
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
   * Embeds centered native QR code.
   * @param {string} url
   * @param {number} [size=6]
   * @param {string} [ec='M']
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
   * Embeds native 1D barcode.
   * @returns {TicketBuilder}
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    this.buffers.push(this.encoder.barcode(type, data, height, width, font, position));
    return this;
  }

  /**
   * Embeds native 2D PDF417 barcode.
   * @returns {TicketBuilder}
   */
  pdf417(data, options = {}) {
    this.buffers.push(this.encoder.pdf417(data, options));
    return this;
  }

  /**
   * Triggers cash drawer.
   * @param {number} [pin=0]
   * @returns {TicketBuilder}
   */
  cashDrawer(pin = 0) {
    this.buffers.push(this.encoder.cashDrawer(pin));
    return this;
  }

  /**
   * Rasterizes and embeds image into command stream (asynchronous).
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
      console.error("[TicketBuilder] Image render failed:", err);
    }
    return this;
  }

  /**
   * Feeds paper by lines.
   * @param {number} [lines=1]
   * @returns {TicketBuilder}
   */
  feed(lines = 1) {
    this.buffers.push(this.encoder.feed(lines));
    return this;
  }

  /**
   * Cuts paper.
   * @param {boolean} [partial=false]
   * @returns {TicketBuilder}
   */
  cut(partial = false) {
    this.buffers.push(this.encoder.cut(partial));
    return this;
  }

  /**
   * Compiles the buffers.
   * @returns {Uint8Array}
   */
  build() {
    return concatUint8Arrays(this.buffers);
  }
}
