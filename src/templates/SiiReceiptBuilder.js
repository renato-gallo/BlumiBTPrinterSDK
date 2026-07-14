import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Chilean SII (Servicio de Impuestos Internos) Receipt Builder.
 * Extends TicketBuilder.
 */
export class SiiReceiptBuilder extends TicketBuilder {
  /**
   * Appends formal Chilean SII header.
   */
  siiHeader(rut, companyName, activity, address, resolutionNum, resolutionYear) {
    this.center();
    this.bold(true);
    this.text(companyName.toUpperCase());
    this.text(`RUT: ${rut}`);
    this.bold(false);
    if (activity) this.text(activity);
    this.text(address);
    this.line();
    this.center();
    this.text(`Resolución S.I.I. Nº ${resolutionNum} del ${resolutionYear}`);
    this.line('=');
    this.left();
    return this;
  }

  /**
   * Adds the SII Electronic Signature Stamp.
   * Prints the "Timbre Electrónico SII" text and compiles either PDF417 or QR code verification.
   * 
   * @param {string} signatureData - The XML string or TED code.
   * @param {Object} [options={}] - Config options ({ usePdf417: boolean, verificationUrl: string }).
   * @returns {SiiReceiptBuilder}
   */
  siiTimbre(signatureData, options = {}) {
    this.center();
    this.text("Timbre Electrónico S.I.I.");
    
    if (options.usePdf417) {
      // Print native PDF417 barcode
      this.pdf417(signatureData, { columns: 10, errorLevel: 5 });
    } else if (options.verificationUrl) {
      // Print standard verification QR code
      this.qr(options.verificationUrl, 6, 'M');
    }
    
    this.text("Verifique documento en www.sii.cl");
    this.left();
    return this;
  }
}
