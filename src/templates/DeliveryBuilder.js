import { TicketBuilder } from "./TicketBuilder.js";

/**
 * Courier / Logistics Delivery Slip Builder.
 * Extends TicketBuilder.
 */
export class DeliveryBuilder extends TicketBuilder {
  /**
   * Appends Courier routing block.
   */
  deliveryHeader(courierName, trackingId, recipientName) {
    this.center();
    this.bold(true);
    this.size(2, 1);
    this.text(courierName.toUpperCase());
    this.size(1, 1);
    this.bold(false);
    this.line();

    // Print Barcode for tracking
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
   * Appends courier route information.
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
