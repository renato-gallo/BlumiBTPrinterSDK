/**
 * Serializes print execution requests to ensure separate data payloads
 * do not write concurrently to the BLE/USB endpoint, preventing connection blockages.
 */
export class PrinterQueue {
  constructor() {
    /**
     * Pending jobs queue.
     * @type {Function[]}
     */
    this.queue = [];
    
    /**
     * Active state flag.
     * @type {boolean}
     */
    this.running = false;
  }

  /**
   * Adds an asynchronous printing operation to the serialization queue.
   * 
   * @param {Function} asyncJob - An async function representing the print operation.
   * @returns {Promise<any>} Resolves when the scheduled job completes.
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
   * Evaluates and runs the next job in sequence.
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
      console.error("[Queue] Print task execution failed:", err);
    } finally {
      this.running = false;
      this._processNext();
    }
  }

  /**
   * Empties all pending operations in the scheduler.
   */
  clear() {
    this.queue = [];
  }
}
