import { PrinterProfile } from "./PrinterProfile.js";

/**
 * GPrinter Profile.
 * Extends PrinterProfile.
 */
export class GPrinterProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "GPrinter Standard";
    this.characterWidth = 48;
  }
}
