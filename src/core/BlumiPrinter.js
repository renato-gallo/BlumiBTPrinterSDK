import { BluetoothConnection } from "../connections/BluetoothConnection.js";
import { EpsonProfile } from "../profiles/EpsonProfile.js";
import { EscPosEncoder } from "./EscPosEncoder.js";
import { PrinterQueue } from "../queue/PrinterQueue.js";
import { TicketBuilder } from "../templates/TicketBuilder.js";
import { InvoiceBuilder } from "../templates/InvoiceBuilder.js";
import { KitchenBuilder } from "../templates/KitchenBuilder.js";
import { DeliveryBuilder } from "../templates/DeliveryBuilder.js";
import { ReceiptBuilder } from "../templates/ReceiptBuilder.js";
import { OpenFacturaBuilder } from "../templates/OpenFacturaBuilder.js";
import { SiiReceiptBuilder } from "../templates/SiiReceiptBuilder.js";
import { concatUint8Arrays, loadImage } from "../utils/utils.js";
import { ImageProcessor } from "../images/ImageProcessor.js";

/**
 * Orquestador principal del BLUMI Printer SDK.
 * Administra conexiones, perfiles físicos de hardware, cola de tareas y constructores de documentos.
 */
export class BlumiPrinter {
  /**
   * @param {Object} [options={}] - Configuraciones del orquestador.
   * @param {PrinterProfile} [options.profile] - Perfil de hardware de la impresora activa. Por defecto EpsonProfile.
   * @param {ConnectionInterface} [options.connection] - Controlador de conexión físico. Por defecto BluetoothConnection.
   * @param {number} [options.characterWidth] - Anulación del ancho de columnas en caracteres. Por defecto el estándar del perfil (48).
   * @param {string} [options.charset='cp850'] - Tabla de códigos de caracteres de destino.
   */
  constructor(options = {}) {
    this.profile = options.profile || new EpsonProfile();
    this.connection = options.connection || new BluetoothConnection();
    this.characterWidth = options.characterWidth || this.profile.characterWidth;
    this.charset = options.charset || 'cp850';
    this.sanitizeSpanish = options.sanitizeSpanish || false;

    // Utilidades del núcleo
    this.encoder = new EscPosEncoder(this.profile, { sanitizeSpanish: this.sanitizeSpanish });
    this.queue = new PrinterQueue();

    this.currentBuffer = [];
    this._resetBuffer();
  }

  /**
   * Limpia el búfer directo de comandos y añade los encabezados de inicialización.
   * @private
   */
  _resetBuffer() {
    this.currentBuffer = [
      this.encoder.initialize(),
      this.encoder.setCodePage(this.charset)
    ];
  }

  /**
   * Establece la conexión física con el dispositivo mediante el controlador.
   * @returns {Promise<boolean>} Devuelve true si la conexión es exitosa.
   */
  async connect() {
    return await this.connection.connect();
  }

  /**
   * Cierra la conexión activa actual.
   * @returns {Promise<void>}
   */
  async disconnect() {
    await this.connection.disconnect();
    this._resetBuffer();
  }

  /**
   * Intenta recuperar o restablecer la conexión activa.
   * @returns {Promise<boolean>}
   */
  async reconnect() {
    return await this.connection.reconnect();
  }

  /**
   * Retorna los detalles y estado del canal de conexión actual.
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

  // API de Encadenamiento Directo (Chaining)

  /**
   * Añade texto plano al búfer de impresión directa.
   * @param {string} string - Texto plano a añadir.
   * @returns {BlumiPrinter}
   */
  text(string) {
    const lineStr = string.endsWith('\n') ? string : string + '\n';
    this.currentBuffer.push(this.encoder.text(lineStr, this.charset));
    return this;
  }

  /**
   * Alterna la impresión en negrita en el búfer directo.
   * @param {boolean} [enabled=true]
   * @returns {BlumiPrinter}
   */
  bold(enabled = true) {
    this.currentBuffer.push(this.encoder.bold(enabled));
    return this;
  }

  /**
   * Ajusta el estilo de subrayado en el búfer directo.
   * @param {boolean|number} [level=true] - Nivel de subrayado o grosor (0-2).
   * @returns {BlumiPrinter}
   */
  underline(level = true) {
    this.currentBuffer.push(this.encoder.underline(level));
    return this;
  }

  /**
   * Alterna el modo inverso (blanco sobre negro) en el búfer directo.
   * @param {boolean} [enabled=true]
   * @returns {BlumiPrinter}
   */
  reverse(enabled = true) {
    this.currentBuffer.push(this.encoder.reverse(enabled));
    return this;
  }

  /**
   * Alterna la rotación de caracteres en 90 grados en el búfer directo.
   * @param {boolean} [enabled=true]
   * @returns {BlumiPrinter}
   */
  rotation(enabled = true) {
    this.currentBuffer.push(this.encoder.rotation(enabled));
    return this;
  }

  /**
   * Define la alineación en el búfer directo.
   * @param {string|number} pos - Puede ser 'left', 'center' o 'right'.
   * @returns {BlumiPrinter}
   */
  align(pos) {
    this.currentBuffer.push(this.encoder.align(pos));
    return this;
  }

  /**
   * Centra la alineación del texto.
   * @returns {BlumiPrinter}
   */
  center() {
    return this.align('center');
  }

  /**
   * Alinea el texto a la izquierda.
   * @returns {BlumiPrinter}
   */
  left() {
    return this.align('left');
  }

  /**
   * Alinea el texto a la derecha.
   * @returns {BlumiPrinter}
   */
  right() {
    return this.align('right');
  }

  /**
   * Modifica el tamaño de la fuente en el búfer directo.
   * @param {number} width - Multiplicador de ancho (1-8).
   * @param {number} height - Multiplicador de alto (1-8).
   * @returns {BlumiPrinter}
   */
  size(width, height) {
    this.currentBuffer.push(this.encoder.fontSize(width, height));
    return this;
  }

  /**
   * Avanza el papel en el búfer directo.
   * @param {number} [lines=1]
   * @returns {BlumiPrinter}
   */
  feed(lines = 1) {
    this.currentBuffer.push(this.encoder.feed(lines));
    return this;
  }

  /**
   * Añade el comando de corte al búfer directo.
   * @param {boolean} [partial=false]
   * @returns {BlumiPrinter}
   */
  cut(partial = false) {
    this.currentBuffer.push(this.encoder.cut(partial));
    return this;
  }

  /**
   * Envía la señal de apertura de cajón en el búfer directo.
   * @param {number} [pin=0] - Pin del cajón (0 para pin 2, 1 para pin 5).
   * @returns {BlumiPrinter}
   */
  cashDrawer(pin = 0) {
    this.currentBuffer.push(this.encoder.cashDrawer(pin));
    return this;
  }

  /**
   * Añade un código QR centrado en el búfer directo.
   * @param {string} url - Contenido del código QR.
   * @param {number} [size=6] - Escala del código QR.
   * @param {string} [ec='M'] - Nivel de corrección de errores (L, M, Q, H).
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
   * Añade un código de barras 1D en el búfer directo.
   * @returns {BlumiPrinter}
   */
  barcode(type, data, height = 80, width = 3, font = 0, position = 2) {
    this.currentBuffer.push(this.encoder.barcode(type, data, height, width, font, position));
    return this;
  }

  /**
   * Añade un código de barras PDF417 en el búfer directo.
   * @returns {BlumiPrinter}
   */
  pdf417(data, options = {}) {
    this.currentBuffer.push(this.encoder.pdf417(data, options));
    return this;
  }

  /**
   * Rasteriza y añade una imagen al búfer directo de impresión (asíncrono).
   * 
   * @param {string|Blob|File|HTMLImageElement} src - Ruta de la imagen o elemento HTMLImageElement.
   * @param {Object} [options={}] - Opciones de tramado y tamaño.
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
      console.error("[BlumiPrinter] Falló la renderización de la imagen:", err);
    }
    return this;
  }

  /**
   * Despacha el contenido actual del búfer de bytes a la cola de envío física y vacía el búfer.
   * @returns {Promise<any>} Resoluble al finalizar la escritura.
   */
  async flush() {
    if (this.currentBuffer.length <= 2) {
      return;
    }

    const bytes = concatUint8Arrays(this.currentBuffer);
    this._resetBuffer();

    return await this._sendBytes(bytes);
  }

  // API de Plantillas Predefinidas

  /**
   * Construye un ticket simple mediante TicketBuilder y lo envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
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
   * Construye una factura genérica mediante InvoiceBuilder y la envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
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
   * Construye una comanda de cocina mediante KitchenBuilder y la envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
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
   * Construye un vale de despacho o entrega mediante DeliveryBuilder y lo envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
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
   * Construye una boleta/recibo estándar mediante ReceiptBuilder y la envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
   * @returns {Promise<any>}
   */
  async receipt(callback) {
    const t = new ReceiptBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Construye un comprobante compatible con OpenFactura mediante OpenFacturaBuilder y lo envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
   * @returns {Promise<any>}
   */
  async openFactura(callback) {
    const t = new OpenFacturaBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Construye una boleta oficial regulada por el SII mediante SiiReceiptBuilder y la envía a la cola.
   * @param {Function} callback - Acciones de configuración en la instancia del constructor.
   * @returns {Promise<any>}
   */
  async siiReceipt(callback) {
    const t = new SiiReceiptBuilder({
      characterWidth: this.characterWidth,
      charset: this.charset,
      encoder: this.encoder
    });
    await callback(t);
    return await this._sendBytes(t.build());
  }

  /**
   * Encola el envío de bytes al canal físico activo de la impresora.
   * @private
   * @param {Uint8Array} bytes
   * @returns {Promise<any>}
   */
  _sendBytes(bytes) {
    return this.queue.add(async () => {
      if (!this.connection.isConnected()) {
        throw new Error("El dispositivo de impresión no se encuentra conectado.");
      }
      await this.connection.send(bytes);
    });
  }
}
