import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras térmicas mediante puerto Serie COM (Web Serial API).
 * Incluye soporte de reconexión automática a puertos previamente autorizados
 * mediante `navigator.serial.getPorts()`, sin necesidad de mostrar el diálogo de selección.
 * Extiende de ConnectionInterface.
 */
export class WebSerialConnection extends ConnectionInterface {
  /**
   * @param {Object} [options={}] - Opciones de apertura del puerto serie.
   * @param {number} [options.baudRate=9600] - Velocidad de transmisión en baudios.
   */
  constructor(options = {}) {
    super();
    this.port = null;
    this.writer = null;
    this.connected = false;
    this.baudRate = options.baudRate || 9600;
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
      return await this._openPort();
    } catch (err) {
      this._resetState();
      throw err;
    }
  }

  /**
   * Intenta reconectar al primer puerto Serie previamente autorizado sin mostrar el
   * diálogo de selección de puerto. Útil al recargar la página.
   * No requiere localStorage: la API Web Serial persiste los permisos de puerto en el
   * navegador de forma nativa entre sesiones.
   * @returns {Promise<boolean>} true si reconectó, false si no hay puertos autorizados disponibles.
   */
  async reconnectSaved() {
    try {
      // Obtiene la lista de puertos COM previamente autorizados en este origen
      const authorizedPorts = await navigator.serial.getPorts();

      if (!authorizedPorts.length) {
        console.warn('[Serial] No hay puertos Serie previamente autorizados disponibles.');
        return false;
      }

      // Conectar al primero disponible (en la mayoría de los casos solo hay una impresora serie)
      this.port = authorizedPorts[0];
      return await this._openPort();
    } catch (err) {
      console.error('[Serial] Error al intentar reconectar puerto Serie guardado:', err);
      this._resetState();
      return false;
    }
  }

  /**
   * @private - Abre el puerto y obtiene el escritor de flujo de salida.
   * @returns {Promise<boolean>}
   */
  async _openPort() {
    await this.port.open({ baudRate: this.baudRate });
    this.writer = this.port.writable.getWriter();
    this.connected = true;
    return true;
  }

  /**
   * @private - Restablece el estado interno del controlador.
   */
  _resetState() {
    this.connected = false;
    this.port = null;
    this.writer = null;
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
      this._resetState();
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
