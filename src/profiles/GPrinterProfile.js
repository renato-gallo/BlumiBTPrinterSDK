import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Perfil de impresora GPrinter Estándar ESC/POS.
 * Extiende de PrinterProfile.
 */
export class GPrinterProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "GPrinter Standard";
    this.characterWidth = 48;
  }
}
