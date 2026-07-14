import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Connection driver for WebUSB thermal printers (Roadmap Stub).
 * Extends ConnectionInterface.
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
    throw new Error("WebUSB Connection is planned for v2.2.0 and is not yet implemented.");
  }

  async disconnect() {
    this.connected = false;
    this.device = null;
  }

  async send(bytes) {
    throw new Error("WebUSB Connection is inactive.");
  }
}
