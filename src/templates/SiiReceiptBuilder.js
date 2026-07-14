import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Constructor de Boletas/Comprobantes regulados bajo el S.I.I. de Chile (Servicio de Impuestos Internos).
 * Extiende de TicketBuilder.
 */
export class SiiReceiptBuilder extends TicketBuilder {
  /**
   * Añade el bloque de cabecera formal del SII chileno.
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
   * Añade la firma del timbre electrónico del SII.
   * Imprime el rótulo "Timbre Electrónico S.I.I." y compila el código de barras PDF417 o el código QR de verificación.
   * 
   * @param {string} signatureData - Los datos XML o código del timbre (TED).
   * @param {Object} [options={}] - Opciones de configuración ({ usePdf417: boolean, verificationUrl: string }).
   * @returns {SiiReceiptBuilder}
   */
  siiTimbre(signatureData, options = {}) {
    this.center();
    this.text("Timbre Electrónico S.I.I.");
    
    if (options.usePdf417) {
      // Imprime el código de barras PDF417 nativo
      this.pdf417(signatureData, { columns: 10, errorLevel: 5 });
    } else if (options.verificationUrl) {
      // Imprime un código QR de verificación estándar
      this.qr(options.verificationUrl, 6, 'M');
    }
    
    this.text("Verifique documento en www.sii.cl");
    this.left();
    return this;
  }
}
