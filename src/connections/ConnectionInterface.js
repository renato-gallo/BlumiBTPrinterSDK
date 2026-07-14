/**
 * Interfaz de conexión abstracta que define los controladores de comunicación.
 * Todos los módulos de conexión (Bluetooth, USB, Serial) deben implementar esta interfaz.
 * 
 * @interface
 */
export class ConnectionInterface extends EventTarget {
  constructor() {
    super();
    if (this.constructor === ConnectionInterface) {
      throw new Error("ConnectionInterface es una clase abstracta y no puede ser instanciada directamente.");
    }
  }

  /**
   * Establece la conexión con el dispositivo.
   * @abstract
   * @returns {Promise<boolean>}
   */
  async connect() {
    throw new Error("El método 'connect()' debe ser implementado.");
  }

  /**
   * Cierra la conexión con el dispositivo.
   * @abstract
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error("El método 'disconnect()' debe ser implementado.");
  }

  /**
   * Envía datos binarios al destino de conexión.
   * @abstract
   * @param {Uint8Array} bytes - Arreglo de comandos binarios.
   * @returns {Promise<void>}
   */
  async send(bytes) {
    throw new Error("El método 'send()' debe ser implementado.");
  }

  /**
   * Verifica el estado activo de la conexión.
   * @abstract
   * @returns {boolean}
   */
  isConnected() {
    throw new Error("El método 'isConnected()' debe ser implementado.");
  }
}
