import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Rongta Profile.
 * Extends PrinterProfile.
 */
export class RongtaProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "Rongta Standard";
    this.characterWidth = 48;
  }
}
