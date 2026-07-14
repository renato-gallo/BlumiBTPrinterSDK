import { TicketBuilder } from "./TicketBuilder.js";

/**
 * OpenFactura Standard Receipt Builder.
 * Extends TicketBuilder.
 */
export class OpenFacturaBuilder extends TicketBuilder {
  /**
   * Header block.
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
   * Reference documents.
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
