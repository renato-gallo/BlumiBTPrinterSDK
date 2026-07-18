import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras térmicas mediante WebUSB.
 * Incluye soporte de reconexión automática a dispositivos previamente autorizados
 * mediante `navigator.usb.getDevices()`, sin necesidad de mostrar el diálogo de selección.
 * Extiende de ConnectionInterface.
 */
export class WebUSBConnection extends ConnectionInterface {
  constructor() {
    super();
    this.device = null;
    this.interfaceNumber = null;
    this.endpointOut = null;
    this.connected = false;
  }

  /**
   * Verifica si la conexión está activa.
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.device?.opened;
  }

  /**
   * Lanza el diálogo nativo de WebUSB para seleccionar y conectar la impresora.
   * @returns {Promise<boolean>}
   */
  async connect() {
    try {
      // Solicitar dispositivo USB filtrando por la clase impresora estándar (0x07)
      this.device = await navigator.usb.requestDevice({
        filters: [{ classCode: 7 }]
      });

      return await this._openDevice();
    } catch (err) {
      this._resetState();
      throw err;
    }
  }

  /**
   * Intenta reconectar a la impresora USB previamente autorizada sin mostrar el
   * diálogo de selección de dispositivo. Útil al recargar la página.
   * No requiere localStorage: la API WebUSB persiste los permisos en el navegador
   * de forma nativa entre sesiones.
   * @returns {Promise<boolean>} true si reconectó, false si no hay impresoras USB autorizadas disponibles.
   */
  async reconnectSaved() {
    try {
      // Obtiene la lista de dispositivos USB previamente autorizados en este origen
      const authorizedDevices = await navigator.usb.getDevices();

      // Filtrar por clase de impresora (classCode 7) entre los autorizados
      const printer = authorizedDevices.find(d =>
        d.configurations.some(c =>
          c.interfaces.some(i =>
            i.alternates.some(a => a.interfaceClass === 7)
          )
        )
      );

      if (!printer) {
        console.warn('[USB] No hay impresoras USB previamente autorizadas disponibles.');
        return false;
      }

      this.device = printer;
      return await this._openDevice();
    } catch (err) {
      console.error('[USB] Error al intentar reconectar dispositivo USB guardado:', err);
      this._resetState();
      return false;
    }
  }

  /**
   * @private - Abre el dispositivo USB, reclama la interfaz y localiza el endpoint bulk OUT.
   * @returns {Promise<boolean>}
   */
  async _openDevice() {
    await this.device.open();

    // Configurar la interfaz de la impresora
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    // Encontrar la interfaz de impresión y el Endpoint Bulk OUT de salida
    const configuration = this.device.configurations[0];
    const alternate = configuration.interfaces.find(iface => {
      return iface.alternates.some(alt => {
        if (alt.interfaceClass === 7) { // Clase impresora
          this.interfaceNumber = iface.interfaceNumber;
          const endpoint = alt.endpoints.find(ep => ep.direction === 'out' && ep.type === 'bulk');
          if (endpoint) {
            this.endpointOut = endpoint.endpointNumber;
            return true;
          }
        }
        return false;
      });
    });

    if (!alternate) {
      throw new Error("No se encontró ninguna interfaz de impresora USB bulk-out compatible.");
    }

    await this.device.claimInterface(this.interfaceNumber);
    this.connected = true;
    return true;
  }

  /**
   * @private - Restablece el estado interno del controlador.
   */
  _resetState() {
    this.connected = false;
    this.device = null;
    this.interfaceNumber = null;
    this.endpointOut = null;
  }

  /**
   * Cierra de forma ordenada la conexión WebUSB.
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.device) {
        if (this.connected && this.interfaceNumber !== null) {
          await this.device.releaseInterface(this.interfaceNumber);
        }
        await this.device.close();
      }
    } finally {
      this._resetState();
    }
  }

  /**
   * Envía los bytes a la impresora USB mediante transferencia masiva.
   * @param {Uint8Array} bytes
   * @returns {Promise<void>}
   */
  async send(bytes) {
    if (!this.isConnected()) {
      throw new Error("No se pueden enviar datos. La conexión USB está inactiva.");
    }

    // Tamaño de bloque de transferencia masiva estándar (64 bytes)
    const CHUNK_SIZE = 64;
    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
      await this.device.transferOut(this.endpointOut, chunk);
    }
  }
}
