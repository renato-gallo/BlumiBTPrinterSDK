import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Perfil de impresora JP80 (específicamente JP80H-UB).
 * Extiende de PrinterProfile.
 */
export class JP80Profile extends PrinterProfile {
  constructor() {
    super();
    this.name = "JP80H-UB";
    this.characterWidth = 48; // Papel de tamaño 80mm
  }
}
