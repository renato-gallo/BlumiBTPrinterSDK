import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras térmicas mediante puerto Serie COM (Web Serial API).
 * Extiende de ConnectionInterface.
 */
export class WebSerialConnection extends ConnectionInterface {
  constructor() {
    super();
    this.port = null;
    this.writer = null;
    this.connected = false;
  }

  /**
   * Verifica si la conexión está activa.
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.port && this.port.writable;
  }

  /**
   * Solicita el puerto Serie y establece la conexión física con la impresora.
   * @returns {Promise<boolean>}
   */
  async connect() {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 }); // Velocidad estándar para la mayoría de impresoras térmicas serie
      this.writer = this.port.writable.getWriter();
      this.connected = true;
      return true;
    } catch (err) {
      this.connected = false;
      this.port = null;
      this.writer = null;
      throw err;
    }
  }

  /**
   * Cierra de forma ordenada el flujo de escritura y el puerto Serie.
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.writer) {
        await this.writer.releaseLock();
      }
      if (this.port) {
        await this.port.close();
      }
    } finally {
      this.connected = false;
      this.port = null;
      this.writer = null;
    }
  }

  /**
   * Envía los bytes mediante la corriente de salida del puerto Serie.
   * @param {Uint8Array} bytes
   * @returns {Promise<void>}
   */
  async send(bytes) {
    if (!this.isConnected()) {
      throw new Error("No se pueden enviar datos. La conexión Serie está inactiva.");
    }
    await this.writer.write(bytes);
  }
}
