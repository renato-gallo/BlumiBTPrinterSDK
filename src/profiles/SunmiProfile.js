import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Perfil de impresora térmica portátil Sunmi.
 * Extiende de PrinterProfile. Reemplaza el comando de corte físico por avance de papel, ya que los dispositivos Sunmi utilizan corte manual.
 */
export class SunmiProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "Sunmi Handheld";
    this.characterWidth = 32; // Sunmi utiliza papel de 58mm por defecto
  }

  /**
   * Comando de corte anulado. Avanza el papel 3 líneas en lugar de cortar.
   * @override
   */
  cut(partial = false) {
    return this.feed(3);
  }
}
