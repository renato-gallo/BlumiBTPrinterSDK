import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Connection driver for Web Serial COM thermal printers (Roadmap Stub).
 * Extends ConnectionInterface.
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
    throw new Error("Web Serial Connection is planned for v2.2.0 and is not yet implemented.");
  }

  async disconnect() {
    this.connected = false;
    this.port = null;
  }

  async send(bytes) {
    throw new Error("Web Serial Connection is inactive.");
  }
}
