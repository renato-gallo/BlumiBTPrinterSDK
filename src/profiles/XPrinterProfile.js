import { PrinterProfile } from "./PrinterProfile.js";

/**
 * XPrinter Profile.
 * Extends PrinterProfile.
 */
export class XPrinterProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "XPrinter Standard";
    this.characterWidth = 48;
  }
}
