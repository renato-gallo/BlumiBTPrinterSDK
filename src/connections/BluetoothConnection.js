import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras térmicas BLE mediante Web Bluetooth.
 * Extiende de ConnectionInterface.
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

    // Configuraciones de UUID por defecto
    this.SERVICE_UUID = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
    this.CHARACTERISTIC_UUID = '49535343-8841-43f4-a8d4-ecbe34729bb3';
  }

  /**
   * Verifica si la conexión está activa.
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.device?.gatt?.connected;
  }

  /**
   * Lanza el diálogo nativo del navegador para seleccionar y emparejar el dispositivo Bluetooth.
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
   * Establece la conexión GATT con el dispositivo.
   * @returns {Promise<boolean>}
   */
  async connect() {
    if (!this.device) {
      // Si no tenemos dispositivo registrado, solicitamos emparejamiento primero
      await this.requestDevice();
    }

    try {
      this._notifyStateChange('connecting');
      
      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService(this.SERVICE_UUID);
      this.characteristic = await this.service.getCharacteristic(this.CHARACTERISTIC_UUID);

      // Configurar detector de desconexión imprevista
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
   * Cierra de forma programada la conexión GATT.
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
   * Intenta recuperar la conexión con el último dispositivo emparejado.
   * @returns {Promise<boolean>}
   */
  async reconnect() {
    if (!this.device) {
      throw new Error("No hay ningún dispositivo registrado. Debe emparejar el dispositivo al menos una vez.");
    }

    if (this.isConnected()) {
      return true;
    }

    this.reconnecting = true;
    this._notifyStateChange('reconnecting');

    const retries = 3;
    for (let i = 1; i <= retries; i++) {
      try {
        console.log(`[BLE] Intentando reconexión ${i}/${retries}...`);
        await this.connect();
        this.reconnecting = false;
        return true;
      } catch (err) {
        console.warn(`[BLE] Intento de reconexión ${i} fallido:`, err);
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    this.reconnecting = false;
    this._notifyStateChange('disconnected', new Error("La reconexión ha fallado tras alcanzar el número máximo de intentos."));
    return false;
  }

  /**
   * Despacha el flujo de datos a la impresora con fraccionamiento (chunking) para evitar saturación del buffer.
   * @param {Uint8Array} bytes - Flujo de comandos binarios compilados.
   * @returns {Promise<void>}
   */
  async send(bytes) {
    if (!this.isConnected() || !this.characteristic) {
      throw new Error("No se pueden enviar datos. La conexión BLE está inactiva.");
    }

    // Tamaño de fraccionamiento del paquete
    const CHUNK_SIZE = 100;
    const DELAY_MS = 15;

    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
      
      try {
        if (this.characteristic.writeValueWithResponse) {
          await this.characteristic.writeValueWithResponse(chunk);
        } else if (this.characteristic.writeValue) {
          // Escritura estándar/heredada con respuesta
          await this.characteristic.writeValue(chunk);
        } else if (this.characteristic.writeValueWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(chunk);
        } else {
          throw new Error("No se encontró ningún método de escritura en la característica BLE.");
        }
      } catch (err) {
        console.warn("[BLE] La escritura falló, intentando alternativa de respaldo:", err);
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
      console.log("[BLE] Desconexión inesperada. Iniciando reconexión automática...");
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
