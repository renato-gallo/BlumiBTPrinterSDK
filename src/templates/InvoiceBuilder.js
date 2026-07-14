import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Standard Invoice Template Builder.
 * Extends TicketBuilder.
 */
export class InvoiceBuilder extends TicketBuilder {
  /**
   * Appends structured company and customer header details.
   * 
   * @param {Object} company - Company metadata ({ name, rut, address }).
   * @param {Object} customer - Customer metadata ({ name, rut, address }).
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
   * Appends billable item row.
   */
  itemRow(name, qty, unitPrice) {
    const total = qty * unitPrice;
    const desc = `${qty}x ${name}`;
    const priceStr = `$${total.toLocaleString('es-CL')}`;
    this.row(desc, priceStr);
    return this;
  }

  /**
   * Appends taxation grid.
   */
  taxBlock(net, vat, total) {
    this.line('-');
    this.row("Neto:", `$${net.toLocaleString('es-CL')}`);
    this.row("IVA (19%):", `$${vat.toLocaleString('es-CL')}`);
    this.total(`$${total.toLocaleString('es-CL')}`);
    return this;
  }
}
