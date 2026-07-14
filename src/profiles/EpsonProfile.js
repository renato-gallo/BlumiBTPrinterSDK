import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Perfil de impresora Epson Estándar ESC/POS.
 * Extiende de PrinterProfile.
 */
export class EpsonProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "Epson Standard";
    this.characterWidth = 48; // Epson 80mm Fuente A
  }
}
