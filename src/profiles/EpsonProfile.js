import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Epson Standard ESC/POS profile.
 * Extends PrinterProfile.
 */
export class EpsonProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "Epson Standard";
    this.characterWidth = 48; // Epson 80mm Font A
  }
}
