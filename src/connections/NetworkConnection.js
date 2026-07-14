import { ConnectionInterface } from "./ConnectionInterface.js";

/**
 * Controlador de conexión para impresoras de red (WiFi / Ethernet) mediante sockets TCP directos (Puerto 9100).
 * Soporta entornos híbridos nativos como Tauri, Electron y Node.js de forma directa.
 * Extiende de ConnectionInterface.
 */
export class NetworkConnection extends ConnectionInterface {
  /**
   * @param {string} [host='192.168.1.100'] - Dirección IP o Hostname de la impresora en la red local.
   * @param {number} [port=9100] - Puerto de impresión TCP Raw (estándar JetDirect 9100).
   */
  constructor(host = '192.168.1.100', port = 9100) {
    super();
    this.host = host;
    this.port = port;
    this.socket = null;
    this.connected = false;
  }

  /**
   * Verifica si la conexión de red está activa.
   * @returns {boolean}
   */
  isConnected() {
    return this.connected && this.socket && !this.socket.destroyed;
  }

  /**
   * Establece un socket TCP directo hacia la impresora.
   * @returns {Promise<boolean>}
   */
  async connect() {
    // Detectamos si el entorno es compatible con sockets TCP nativos (Node.js, Electron o Tauri)
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
    const isTauri = typeof window !== 'undefined' && window.__TAURI__;

    if (isNode || isTauri) {
      try {
        const net = await import('net');
        return new Promise((resolve, reject) => {
          this.socket = new net.Socket();

          this.socket.connect(this.port, this.host, () => {
            this.connected = true;
            resolve(true);
          });

          this.socket.on('error', (err) => {
            this.connected = false;
            reject(err);
          });

          this.socket.on('close', () => {
            this.connected = false;
          });
        });
      } catch (err) {
        throw new Error(`Error de sistema al cargar sockets de red nativos: ${err.message}`);
      }
    } else {
      // Si corre en un navegador web puro y ordinario
      throw new Error(
        "Las conexiones TCP directas (WiFi/Ethernet) no están soportadas nativamente por navegadores web debido a restricciones del Sandbox de seguridad. " +
        "Utilice WebUSB, Web Bluetooth o configure un puente WebSocket/HTTP local en su red local."
      );
    }
  }

  /**
   * Destruye y desconecta el socket TCP.
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.socket) {
      this.socket.destroy();
    }
    this.connected = false;
    this.socket = null;
  }

  /**
   * Escribe el flujo binario directamente en el canal TCP abierto de la impresora.
   * @param {Uint8Array} bytes
   * @returns {Promise<void>}
   */
  async send(bytes) {
    if (!this.isConnected()) {
      throw new Error("No se pueden enviar datos. La conexión de red TCP está inactiva o cerrada.");
    }

    return new Promise((resolve, reject) => {
      this.socket.write(bytes, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
