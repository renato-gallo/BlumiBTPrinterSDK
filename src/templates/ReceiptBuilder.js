import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Constructor de Plantilla de Boleta/Recibo Estándar.
 * Extiende de TicketBuilder para ofrecer métodos semánticos especializados para comercio.
 */
export class ReceiptBuilder extends TicketBuilder {
  /**
   * Añade el bloque de cabecera de la boleta.
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
   * Añade una fila de producto/servicio.
   */
  item(name, qty, price) {
    const total = qty * price;
    const formattedTotal = `$${total.toLocaleString('es-CL')}`;
    const leftText = `${qty}x ${name}`;
    this.row(leftText, formattedTotal);
    return this;
  }

  /**
   * Añade el desglose del resumen de totales.
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
   * Añade el texto de pie de página centrado.
   */
  footer(msg) {
    this.feed(1);
    this.center();
    this.text(msg);
    this.left();
    return this;
  }
}
