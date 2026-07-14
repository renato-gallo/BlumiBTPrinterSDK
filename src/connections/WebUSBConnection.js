import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras térmicas mediante WebUSB (Borrador del Roadmap).
 * Extiende de ConnectionInterface.
 */
export class WebUSBConnection extends ConnectionInterface {
  constructor() {
    super();
    this.device = null;
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  async connect() {
    throw new Error("La conexión WebUSB está planificada para la versión v2.2.0 y aún no ha sido implementada.");
  }

  async disconnect() {
    this.connected = false;
    this.device = null;
  }

  async send(bytes) {
    throw new Error("La conexión WebUSB se encuentra inactiva.");
  }
}
