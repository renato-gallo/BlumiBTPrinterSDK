import { BluetoothConnection } from "../connections/BluetoothConnection.js";
import { EpsonProfile } from "../profiles/EpsonProfile.js";
import { EscPosEncoder } from "./EscPosEncoder.js";
import { PrinterQueue } from "../queue/PrinterQueue.js";
import { TicketBuilder } from "../templates/TicketBuilder.js";
import { InvoiceBuilder } from "../templates/InvoiceBuilder.js";
import { KitchenBuilder } from "../templates/KitchenBuilder.js";
import { DeliveryBuilder } from "../templates/DeliveryBuilder.js";
import { concatUint8Arrays, loadImage } from "../utils/utils.js";
import { ImageProcessor } from "../images/ImageProcessor.js";

/**
 * Core orchestrator of the BLUMI Printer SDK.
 * Manages connections, physical hardware profiles, job queueing, and document builders.
 */
export class BlumiPrinter {
  /**
   * @param {Object} [options={}] - Orchestrator configurations.
   * @param {PrinterProfile} [options.profile] - Active printer hardware profile. Defaults to EpsonProfile.
   * @param {ConnectionInterface} [options.connection] - Connection backend driver. Defaults to BluetoothConnection.
   * @param {number} [options.characterWidth] - Text columns width override. Defaults to profile standard (48).
   * @param {string} [options.charset='cp850'] - Target character code page encoding.
   */
  constructor(options = {}) {
    this.profile = options.profile || new EpsonProfile();
    this.connection = options.connection || new BluetoothConnection();
    this.characterWidth = options.characterWidth || this.profile.characterWidth;
    this.charset = options.charset || 'cp850';
    this.sanitizeSpanish = options.sanitizeSpanish || false;

    // Core utilities
    this.encoder = new EscPosEncoder(this.profile, { sanitizeSpanish: this.sanitizeSpanish });
    this.queue = new PrinterQueue();

    this.currentBuffer = [];
    this._resetBuffer();
  }

  /**
   * Clears the direct printing buffer and appends initialization headers.
   * @private
   */
  _resetBuffer() {
    this.currentBuffer = [
      this.encoder.initialize(),
      this.encoder.setCodePage(this.charset)
    ];
  }

  /**
   * Establishes active device connection via connection driver.
   * @returns {Promise<boolean>} Resolves to true if successfully connected.
   */
  async connect() {
    return await this.connection.connect();
  }

  /**
   * Closes active connection.
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.connection.disconnect();
    this._resetBuffer();
  }

  /**
   * Attempts connection recovery.
   * @returns {Promise<boolean>}
   */
  async reconnect() {
    return await this.connection.reconnect();
  }

  /**
   * Retrieves active connection details.
   * @returns {Object}
   */
  status() {
    return {
      connected: this.connection.isConnected(),
      reconnecting: this.connection.reconnecting,
      device: this.connection.device
        ? { name: this.connection.device.name, id: this.connection.device.id }
        : null
    };
  }

  // Chaining API

  /**
   * Appends text to direct buffer.
   * @param {string} string - Plain text.
   * @returns {BlumiPrinter}
   */
  text(string) {
    const lineStr = string.endsWith('\n') ? string : string + '\n';
    this.currentBuffer.push(this.encoder.text(lineStr, this.charset));
    return this;
  }

  /**
   * Toggles bold printing in direct buffer.
   * @param {boolean} [enabled=true]
   * @returns {BlumiPrinter}
   */
  bold(enabled = true) {
    this.currentBuffer.push(this.encoder.bold(enabled));
    return this;
  }

  /**
   * Sets underline style in direct buffer.
   * @param {boolean|number} [level=true] - State or stroke thickness.
   * @returns {BlumiPrinter}
   */
  underline(level = true) {
    this.currentBuffer.push(this.encoder.underline(level));
    return this;
  }

  /**
   * Toggles negative print mode in direct buffer.
   * @param {boolean} [enabled=true]
   * @returns {BlumiPrinter}
   */
  reverse(enabled = true) {
    this.currentBuffer.push(this.encoder.reverse(enabled));
    return this;
  }

  /**
   * Toggles 90-degree text rotation in direct buffer.
   * @param {boolean} [enabled=true]
   * @returns {BlumiPrinter}
   */
  rotation(enabled = true) {
    this.currentBuffer.push(this.encoder.rotation(enabled));
    return this;
  }

  /**
   * Sets alignment in direct buffer.
   * @param {string|number} pos - 'left', 'center', 'right'.
   * @returns {BlumiPrinter}
   */
  align(pos) {
    this.currentBuffer.push(this.encoder.align(pos));
    return this;
  }

  /**
   * Centers alignment in direct buffer.
   * @returns {BlumiPrinter}
   */
  center() {
    return this.align('center');
  }

  /**
   * Left-aligns alignment in direct buffer.
   * @returns {BlumiPrinter}
   */
  left() {
    return this.align('left');
  }

  /**
   * Right-aligns alignment in direct buffer.
   * @returns {BlumiPrinter}
   */
  right() {
    return this.align('right');
  }

  /**
   * Modifies character sizes in direct buffer.
   * @param {number} width
   * @param {number} height
   * @returns {BlumiPrinter}
   */
  size(width, height) {
    this.currentBuffer.push(this.encoder.fontSize(width, height));
    return this;
  }

  /**
   * Feeds paper in direct buffer.
   * @param {number} [lines=1]
   * @returns {BlumiPrinter}
   */
  feed(lines = 1) {
    this.currentBuffer.push(this.encoder.feed(lines));
    return this;
  }

  /**
   * Cuts paper in direct buffer.
   * @param {boolean} [partial=false]
   * @returns {BlumiPrinter}
   */
  cut(partial = false) {
    this.currentBuffer.push(this.encoder.cut(partial));
    return this;
  }

  /**
   * Triggers drawer kick in direct buffer.
   * @param {number} [pin=0] - Drawer pin index (0 for pin 2, 1 for pin 5).
   * @returns {BlumiPrinter}
   */
  cashDrawer(pin = 0) {
    this.currentBuffer.push(this.encoder.cashDrawer(pin));
    return this;
  }

  /**
   * Embeds a centered native QR code in direct buffer.
   * @param {string} url - QR payload.
   * @param {number} [size=6]
   * @param {string} [ec='M']
   * @returns {BlumiPrinter}
   */
  qr(url, size = 6, ec = 'M') {
    this.center();
    this.currentBuffer.push(this.encoder.qr(url, size, ec));
    this.feed(1);
    this.left();
    return this;
  }

  /**
   * Embeds a native 1D barcode in direct buffer.
   * @returns {BlumiPrinter}
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    this.currentBuffer.push(this.encoder.barcode(type, data, height, width, font, position));
    return this;
  }

  /**
   * Embeds a native 2D PDF417 barcode in direct buffer.
   * @returns {BlumiPrinter}
   */
  pdf417(data, options = {}) {
    this.currentBuffer.push(this.encoder.pdf417(data, options));
    return this;
  }

  /**
   * Rasterizes and appends image to direct buffer (asynchronous).
   * 
   * @param {string|Blob|File|HTMLImageElement} src - Image source.
   * @param {Object} [options={}] - Dithering and size configurations.
   * @returns {Promise<BlumiPrinter>}
   */
  async image(src, options = {}) {
    try {
      const img = await loadImage(src);
      const align = options.align || 'center';
      
      this.currentBuffer.push(this.encoder.align(align));

      const defaultWidth = this.characterWidth === 32 ? 256 : 384;
      const targetWidth = options.width || defaultWidth;

      const raster = ImageProcessor.process(img, {
        width: targetWidth,
        threshold: options.threshold,
        dither: options.dither !== undefined ? options.dither : 'floyd-steinberg'
      });

      this.currentBuffer.push(this.encoder.rasterImage(raster.width, raster.height, raster.data));
      this.currentBuffer.push(this.encoder.feed(1));
      this.currentBuffer.push(this.encoder.align('left'));
    } catch (err) {
      console.error("[BlumiPrinter] Image render failed:", err);
    }
    return this;
  }

  /**
   * Submits direct buffer byte stream to serialization queue and clears buffer.
   * @returns {Promise<any>} Resolves when write finishes.
   */
  async flush() {
    if (this.currentBuffer.length <= 2) {
      return;
    }

    const bytes = concatUint8Arrays(this.currentBuffer);
    this._resetBuffer();

    return await this._sendBytes(bytes);
  }

  // Template API

  /**
   * Assembles a ticket via TicketBuilder and prints it.
   * @param {Function} callback - Setup operations on TicketBuilder instance.
   * @returns {Promise<any>}
   */
  async ticket(callback) {
    const t = new TicketBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Assembles an invoice via InvoiceBuilder and prints it.
   * @param {Function} callback - Setup operations on InvoiceBuilder instance.
   * @returns {Promise<any>}
   */
  async invoice(callback) {
    const t = new InvoiceBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Assembles a kitchen order ticket via KitchenBuilder and prints it.
   * @param {Function} callback - Setup operations on KitchenBuilder instance.
   * @returns {Promise<any>}
   */
  async kitchen(callback) {
    const t = new KitchenBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Assembles a delivery invoice via DeliveryBuilder and prints it.
   * @param {Function} callback - Setup operations on DeliveryBuilder instance.
   * @returns {Promise<any>}
   */
  async delivery(callback) {
    const t = new DeliveryBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Schedules byte delivery via connection driver in serialization queue.
   * @private
   * @param {Uint8Array} bytes
   * @returns {Promise<any>}
   */
  _sendBytes(bytes) {
    return this.queue.add(async () => {
      if (!this.connection.isConnected()) {
        throw new Error("Device is not connected.");
      }
      await this.connection.send(bytes);
    });
  }
}
