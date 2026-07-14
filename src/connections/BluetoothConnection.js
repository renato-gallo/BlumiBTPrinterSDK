import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Connection driver for Web Bluetooth BLE thermal printers.
 * Extends ConnectionInterface.
 */
export class BluetoothConnection extends ConnectionInterface {
  constructor() {
    super();
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.connected = false;
    this.reconnecting = false;
    this.autoReconnectEnabled = true;

    // Default UUID configurations
    this.SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
    this.CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';
  }

  /**
   * Checks if connection is active.
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.device?.gatt?.connected;
  }

  /**
   * Triggers the Web Bluetooth pairing selection prompt.
   * @returns {Promise<BluetoothDevice>}
   */
  async requestDevice() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      });

      this.server = null;
      this.service = null;
      this.characteristic = null;
      this.connected = false;

      return this.device;
    } catch (err) {
      this.device = null;
      this._notifyStateChange('disconnected', err);
      throw err;
    }
  }

  /**
   * Establishes GATT connection.
   * @returns {Promise<boolean>}
   */
  async connect() {
    if (!this.device) {
      // If we don't have a device, call requestDevice first
      await this.requestDevice();
    }

    try {
      this._notifyStateChange('connecting');
      
      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);
      this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

      // Setup spontaneous disconnection listener
      this.device.removeEventListener('gattserverdisconnected', this._onDisconnected);
      this.device.addEventListener('gattserverdisconnected', this._onDisconnected.bind(this));

      this.connected = true;
      this._notifyStateChange('connected');
      return true;
    } catch (err) {
      this.connected = false;
      this._notifyStateChange('disconnected', err);
      throw err;
    }
  }

  /**
   * Programmatically closes the GATT connection.
   * @returns {Promise<void>}
   */
  async disconnect() {
    const wasAutoReconnect = this.autoReconnectEnabled;
    this.autoReconnectEnabled = false;

    try {
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
    } finally {
      this.connected = false;
      this.server = null;
      this.service = null;
      this.characteristic = null;
      this.autoReconnectEnabled = wasAutoReconnect;
      this._notifyStateChange('disconnected');
    }
  }

  /**
   * Reconnects to the previously paired device.
   * @returns {Promise<boolean>}
   */
  async reconnect() {
    if (!this.device) {
      throw new Error("No device recorded. Must pair at least once.");
    }

    if (this.isConnected()) {
      return true;
    }

    this.reconnecting = true;
    this._notifyStateChange('reconnecting');

    const retries = 3;
    for (let i = 1; i <= retries; i++) {
      try {
        console.log(`[BLE] Reconnecting attempt ${i}/${retries}...`);
        await this.connect();
        this.reconnecting = false;
        return true;
      } catch (err) {
        console.warn(`[BLE] Reconnect attempt ${i} failed:`, err);
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    this.reconnecting = false;
    this._notifyStateChange('disconnected', new Error("Reconnection failed after maximum attempts."));
    return false;
  }

  /**
   * Dispatches data to printer with MTU chunk throttling to prevent hardware buffer loss.
   * @param {Uint8Array} bytes - Compiled command stream.
   * @returns {Promise<void>}
   */
  async send(bytes) {
    if (!this.isConnected() || !this.characteristic) {
      throw new Error("Cannot send data. BLE connection is inactive.");
    }

    // Packet split size
    const CHUNK_SIZE = 100;
    const DELAY_MS = 15;

    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
      
      try {
        if (this.characteristic.writeValueWithResponse) {
          await this.characteristic.writeValueWithResponse(chunk);
        } else if (this.characteristic.writeValue) {
          // Standard/Legacy write (with response)
          await this.characteristic.writeValue(chunk);
        } else if (this.characteristic.writeValueWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(chunk);
        } else {
          throw new Error("No BLE characteristic write method found.");
        }
      } catch (err) {
        console.warn("[BLE] write failed, attempting fallback:", err);
        if (this.characteristic.writeValue) {
          await this.characteristic.writeValue(chunk);
        } else {
          throw err;
        }
      }

      if (offset + CHUNK_SIZE < bytes.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }
  }

  /**
   * @private
   */
  _onDisconnected() {
    this.connected = false;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this._notifyStateChange('disconnected');

    if (this.autoReconnectEnabled) {
      console.log("[BLE] Unexpected disconnection. Initiating auto-reconnect...");
      this.reconnect();
    }
  }

  /**
   * @private
   */
  _notifyStateChange(state, error = null) {
    this.dispatchEvent(new CustomEvent('statuschange', {
      detail: { state, error }
    }));
  }
}
