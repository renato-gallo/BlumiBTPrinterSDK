import { PrinterProfile } from "./PrinterProfile.js";

/**
 * Sunmi Handheld Thermal Printer Profile.
 * Extends PrinterProfile. Overrides cut commands to feed-only, as Sunmi devices use manual tear bars.
 */
export class SunmiProfile extends PrinterProfile {
  constructor() {
    super();
    this.name = "Sunmi Handheld";
    this.characterWidth = 32; // Sunmi uses 58mm paper by default
  }

  /**
   * Overridden cut command. Feeds paper by 3 lines instead of cutting.
   * @override
   */
  cut(partial = false) {
    return this.feed(3);
  }
}
