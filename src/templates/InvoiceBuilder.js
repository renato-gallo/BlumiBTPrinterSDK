import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Constructor de Plantilla de Factura Estándar.
 * Extiende de TicketBuilder.
 */
export class InvoiceBuilder extends TicketBuilder {
  /**
   * Añade el bloque estructurado de cabecera con detalles de la empresa emisora y el cliente.
   * 
   * @param {Object} company - Metadatos de la empresa ({ name, rut, address }).
   * @param {Object} customer - Metadatos del cliente ({ name, rut, address }).
   * @returns {InvoiceBuilder}
   */
  invoiceHeader(company, customer) {
    this.center();
    this.bold(true);
    this.text(company.name.toUpperCase());
    this.bold(false);
    this.text(`RUT: ${company.rut}`);
    this.text(company.address);
    this.line('=');

    this.left();
    this.bold(true);
    this.text("FACTURA ELECTRÓNICA");
    this.bold(false);
    this.line();
    
    this.text(`CLIENTE: ${customer.name}`);
    this.text(`RUT:     ${customer.rut}`);
    this.text(`DIR:     ${customer.address}`);
    this.line('-');
    return this;
  }

  /**
   * Añade una fila de producto/servicio facturable.
   */
  itemRow(name, qty, unitPrice) {
    const total = qty * unitPrice;
    const desc = `${qty}x ${name}`;
    const priceStr = `$${total.toLocaleString('es-CL')}`;
    this.row(desc, priceStr);
    return this;
  }

  /**
   * Añade el bloque de desglose impositivo (Neto, IVA, Total).
   */
  taxBlock(net, vat, total) {
    this.line('-');
    this.row("Neto:", `$${net.toLocaleString('es-CL')}`);
    this.row("IVA (19%):", `$${vat.toLocaleString('es-CL')}`);
    this.total(`$${total.toLocaleString('es-CL')}`);
    return this;
  }
}
