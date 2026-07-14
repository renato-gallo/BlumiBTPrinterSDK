/**
 * Abstract connection interface that defines connection drivers.
 * All connection modules (Bluetooth, USB, Serial) must implement this interface.
 * 
 * @interface
 */
export class ConnectionInterface extends EventTarget {
  constructor() {
    super();
    if (this.constructor === ConnectionInterface) {
      throw new Error("ConnectionInterface is abstract and cannot be instantiated directly.");
    }
  }

  /**
   * Establish the device connection.
   * @abstract
   * @returns {Promise<boolean>}
   */
  async connect() {
    throw new Error("Method 'connect()' must be implemented.");
  }

  /**
   * Sever the device connection.
   * @abstract
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error("Method 'disconnect()' must be implemented.");
  }

  /**
   * Dispatch byte data to the connection target.
   * @abstract
   * @param {Uint8Array} bytes - Array of commands.
   * @returns {Promise<void>}
   */
  async send(bytes) {
    throw new Error("Method 'send()' must be implemented.");
  }

  /**
   * Verify the active connection status.
   * @abstract
   * @returns {boolean}
   */
  isConnected() {
    throw new Error("Method 'isConnected()' must be implemented.");
  }
}
