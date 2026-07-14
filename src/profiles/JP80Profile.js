import { PrinterProfile } from "./PrinterProfile.js";

/**
 * JP80 Profile (specifically JP80H-UB).
 * Extends PrinterProfile.
 */
export class JP80Profile extends PrinterProfile {
  constructor() {
    super();
    this.name = "JP80H-UB";
    this.characterWidth = 48; // 80mm paper size
  }
}
