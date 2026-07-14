import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Perfil de impresora Rongta Estándar ESC/POS.
 * Extiende de PrinterProfile.
 */
export class RongtaProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "Rongta Standard";
    this.characterWidth = 48;
  }
}
