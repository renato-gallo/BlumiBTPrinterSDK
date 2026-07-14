import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Constructor de Plantilla de Vale de Despacho, Envíos y Logística.
 * Extiende de TicketBuilder.
 */
export class DeliveryBuilder extends TicketBuilder {
  /**
   * Añade el bloque de cabecera de la empresa de transporte y código de barras.
   */
  deliveryHeader(courierName, trackingId, recipientName) {
    this.center();
    this.bold(true);
    this.size(2, 1);
    this.text(courierName.toUpperCase());
    this.size(1, 1);
    this.bold(false);
    this.line();

    // Imprimir código de barras nativo para seguimiento
    this.center();
    this.barcode('code128', trackingId, 70, 3, 0, 2);
    this.feed(1);
    
    this.left();
    this.bold(true);
    this.text(`DESTINATARIO: ${recipientName}`);
    this.bold(false);
    return this;
  }

  /**
   * Añade la información de despacho (dirección, ciudad y sector/zona).
   */
  routeInfo(address, city, zoneCode = "") {
    this.text(`DIRECCIÓN: ${address}`);
    this.text(`CIUDAD:    ${city.toUpperCase()}`);
    if (zoneCode) {
      this.bold(true);
      this.size(2, 2);
      this.text(`ZONA: ${zoneCode}`);
      this.size(1, 1);
      this.bold(false);
    }
    this.line('-');
    return this;
  }
}
