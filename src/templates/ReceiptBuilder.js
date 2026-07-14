import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Standard Receipt Template Builder.
 * Extends TicketBuilder to offer specialized business semantic methods.
 */
export class ReceiptBuilder extends TicketBuilder {
  /**
   * Appends header block.
   */
  receiptHeader(title, subtitle = "", address = "") {
    this.center();
    this.bold(true);
    this.text(title.toUpperCase());
    this.bold(false);
    if (subtitle) this.text(subtitle);
    if (address) this.text(address);
    this.line();
    this.left();
    return this;
  }

  /**
   * Appends item rows.
   */
  item(name, qty, price) {
    const total = qty * price;
    const formattedTotal = `$${total.toLocaleString('es-CL')}`;
    const leftText = `${qty}x ${name}`;
    this.row(leftText, formattedTotal);
    return this;
  }

  /**
   * Appends payment summaries.
   */
  summary(subtotal, tax, total) {
    this.line();
    this.row("Subtotal", `$${subtotal.toLocaleString('es-CL')}`);
    if (tax > 0) {
      this.row("IVA", `$${tax.toLocaleString('es-CL')}`);
    }
    this.total(`$${total.toLocaleString('es-CL')}`);
    return this;
  }

  /**
   * Appends centered footer text.
   */
  footer(msg) {
    this.feed(1);
    this.center();
    this.text(msg);
    this.left();
    return this;
  }
}
