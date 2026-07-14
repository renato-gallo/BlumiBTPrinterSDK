import { TicketBuilder } from "./TicketBuilder.js";

/**
 * High-visibility Kitchen Order Builder.
 * Extends TicketBuilder.
 */
export class KitchenBuilder extends TicketBuilder {
  /**
   * Appends large order identifier.
   */
  kitchenHeader(orderNum, table = "", time = "") {
    this.center();
    this.size(2, 2);
    this.bold(true);
    this.text(`PEDIDO #${orderNum}`);
    this.size(1, 1);
    this.bold(false);
    
    if (table) {
      this.bold(true);
      this.text(`MESA: ${table.toUpperCase()}`);
      this.bold(false);
    }
    if (time) {
      this.text(`Hora: ${time}`);
    }
    this.line('=');
    this.left();
    return this;
  }

  /**
   * Appends kitchen item with double size quantity for clear picking.
   */
  addKitchenItem(name, qty, modifiers = []) {
    this.bold(true);
    this.text(`${qty}x ${name.toUpperCase()}`);
    this.bold(false);
    
    for (const mod of modifiers) {
      this.text(`  * Sin ${mod}`);
    }
    this.line();
    return this;
  }

  /**
   * Appends critical comments in negative block.
   */
  attention(text) {
    this.center();
    this.reverse(true);
    this.text(` *** ${text.toUpperCase()} *** `);
    this.reverse(false);
    this.left();
    return this;
  }
}
