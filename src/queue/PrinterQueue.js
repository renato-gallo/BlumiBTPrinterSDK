/**
 * Serializa las solicitudes de ejecución de impresión para asegurar que los flujos de datos
 * no se escriban de forma concurrente en el canal BLE/USB, previniendo bloqueos en la conexión.
 */
export class PrinterQueue {
  constructor() {
    /**
     * Cola de trabajos de impresión pendientes.
     * @type {Function[]}
     */
    this.queue = [];
    
    /**
     * Indicador de estado de ejecución activa de la cola.
     * @type {boolean}
     */
    this.running = false;
  }

  /**
   * Añade una operación de impresión asíncrona a la cola de serialización.
   * 
   * @param {Function} asyncJob - Función asíncrona que representa la operación de impresión.
   * @returns {Promise<any>} Resoluble cuando se completa el trabajo programado.
   */
  add(asyncJob) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await asyncJob();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      
      this._processNext();
    });
  }

  /**
   * Evalúa y ejecuta la siguiente tarea de la cola en secuencia.
   * @private
   */
  async _processNext() {
    if (this.running || this.queue.length === 0) {
      return;
    }

    this.running = true;
    const task = this.queue.shift();

    try {
      await task();
    } catch (err) {
      console.error("[Queue] Falló la ejecución de la tarea de impresión:", err);
    } finally {
      this.running = false;
      this._processNext();
    }
  }

  /**
   * Vacía todas las operaciones de impresión pendientes en la cola.
   */
  clear() {
    this.queue = [];
  }
}
