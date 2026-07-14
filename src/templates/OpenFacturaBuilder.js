import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Constructor de Plantilla de Boleta/Comprobante compatible con OpenFactura.
 * Extiende de TicketBuilder.
 */
export class OpenFacturaBuilder extends TicketBuilder {
  /**
   * Bloque de cabecera de la boleta.
   */
  openFacturaHeader(title, companyRut, docNum) {
    this.center();
    this.bold(true);
    this.text(title.toUpperCase());
    this.text(`RUT: ${companyRut}`);
    this.size(2, 1);
    this.text(`Nº DOCUMENTO: ${docNum}`);
    this.size(1, 1);
    this.bold(false);
    this.line();
    this.left();
    return this;
  }

  /**
   * Bloque para documentos de referencia.
   */
  reference(docType, docNum, date) {
    this.bold(true);
    this.text("DOCUMENTO REFERENCIA:");
    this.bold(false);
    this.text(`Tipo: ${docType} | Folio: ${docNum}`);
    this.text(`Fecha: ${date}`);
    this.line('-');
    return this;
  }
}
