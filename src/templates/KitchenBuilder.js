import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Constructor de Plantilla de Comanda de Cocina de alta visibilidad.
 * Extiende de TicketBuilder.
 */
export class KitchenBuilder extends TicketBuilder {
  /**
   * Añade el bloque de cabecera con el número de pedido en tamaño grande.
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
   * Añade un plato o producto a preparar a la comanda.
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
   * Añade advertencias críticas (alérgenos, notas de cliente) en un bloque invertido destacado.
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
