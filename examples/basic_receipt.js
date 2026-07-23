import { BlumiPrinter } from "../src/core/BlumiPrinter.js";
import { JP80Profile } from "../src/profiles/JP80Profile.js";

/**
 * Example: Printing a standard customer receipt using the BlumiPrinter SDK.
 * Run in a secure context (localhost/HTTPS) inside a browser triggered by a user gesture.
 */
async function printReceiptExample() {
  // Initialize printer with JP80H-UB profile (80mm, 48 characters width)
  const printer = new BlumiPrinter({
    profile: new JP80Profile(),
    charset: 'cp850'
  });

  try {
    console.log("Searching for BLE devices...");
    // 1. Establish Bluetooth connection
    await printer.connect();
    console.log("Printer connected successfully!");

    // 2. Submit print job using the ticket callback
    await printer.ticket(async (ticket) => {
      // Optional: Add a logo (will load asynchronously)
      // await ticket.image("https://example.com/logo.png", { dither: true });

      ticket.center()
        .bold(true)
        .text("BLUMI SOLUTIONS SPA")
        .bold(false)
        .text("RUT: 12.345.678-9")
        .text("Av. Calle Ejemplo 123, Chile")
        .line()
        .left()
        .text("BOLETA ELECTRÓNICA: Nº 456")
        .text(`Fecha: ${new Date().toLocaleDateString()}`)
        .line()
        .row("1x Producto de Calzado", "$69.990")
        .row("2x Calcetines Especiales", "$16.000")
        .row("Descuento Promoción", "-$5.000")
        .line()
        .total("$80.990")
        .feed(1)
        .center()
        .text("Timbre Electrónico SII")
        .qr("https://www.sii.cl/verificar?folio=456&rut=12345678-9")
        .feed(3)
        .cut();
    });

    console.log("Print job completed.");
  } catch (err) {
    console.error("Print job failed:", err);
  }
}
