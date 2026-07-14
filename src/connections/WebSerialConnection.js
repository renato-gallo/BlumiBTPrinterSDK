import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras térmicas mediante puerto Serie Web COM (Borrador del Roadmap).
 * Extiende de ConnectionInterface.
 */
export class WebSerialConnection extends ConnectionInterface {
  constructor() {
    super();
    this.port = null;
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  async connect() {
    throw new Error("La conexión Web Serial está planificada para la versión v2.2.0 y aún no ha sido implementada.");
  }

  async disconnect() {
    this.connected = false;
    this.port = null;
  }

  async send(bytes) {
    throw new Error("La conexión Web Serial se encuentra inactiva.");
  }
}
