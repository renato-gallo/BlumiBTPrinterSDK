import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Perfil de impresora XPrinter Estándar ESC/POS.
 * Extiende de PrinterProfile.
 */
export class XPrinterProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "XPrinter Standard";
    this.characterWidth = 48;
  }
}
