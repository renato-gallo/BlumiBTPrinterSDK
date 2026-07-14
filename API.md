# BLUMI Printer SDK - API Reference

Comprehensive class and method reference for the **BLUMI Printer SDK**.

---

## 1. BlumiPrinter

The main orchestrator class that coordinates connections, active profiles, task serialization, and document builders.

### `constructor(options = {})`
- `options.profile`: The printer hardware profile class. Defaults to `new EpsonProfile()`.
- `options.connection`: The connection driver backend. Defaults to `new BluetoothConnection()`.
- `options.characterWidth`: Number of characters per line. Defaults to profile standard (48).
- `options.charset`: The default character set. Defaults to `'cp850'`.

### `async connect()`
Prompts user pairing panel and connects to the printer GATT/USB.

### `async disconnect()`
Closes active device connection.

### `async reconnect()`
Reconnects to the previously paired device.

### `status()`
Returns an object indicating connection flags: `{ connected: boolean, reconnecting: boolean, device: { name, id } }`.

### `async ticket(callback)`
Builds a document using `TicketBuilder` and prints it.
- `callback(ticket)`: A function receiving a `TicketBuilder` instance.

### `async invoice(callback)`
Builds a document using `InvoiceBuilder` and prints it.
- `callback(invoice)`: A function receiving an `InvoiceBuilder` instance.

### `async kitchen(callback)`
Builds a document using `KitchenBuilder` and prints it.
- `callback(kitchen)`: A function receiving a `KitchenBuilder` instance.

### `async delivery(callback)`
Builds a document using `DeliveryBuilder` and prints it.
- `callback(delivery)`: A function receiving a `DeliveryBuilder` instance.

---

## 2. TicketBuilder

The base semantic template builder. Exposes chainable design methods.

### `text(string)`
Appends a line of text (automatically adds trailing `\n`).

### `bold(enabled = true)`
Enables/disables bold text.

### `align(position)`
Sets alignment: `'left'`, `'center'`, or `'right'`.

### `size(width, height)`
Changes text scaling (width/height multipliers from 1 to 8).

### `line(char = '-')`
Prints a line of repeating characters stretching the full paper width.

### `row(left, right)`
Formats two columns, left and right aligned, with automated text truncation.

### `total(value)`
Inserts a total block bounded by double lines.

### `qr(url, size = 6, ec = 'M')`
Embeds a centered native QR code.

### `async image(source, options = {})`
Loads and rasterizes an image.
- `options.width`: Output width in pixels (rounded to multiples of 8).
- `options.threshold`: Cutoff value (0-255).
- `options.dither`: Image dithering algorithm: `'floyd-steinberg'`, `'atkinson'`, `'bayer'`, or `false` (default threshold).

### `feed(lines = 1)`
Feeds paper by `lines`.

### `cut()`
Sends a paper-cut instruction.

---

## 3. Specialized Builders

### `InvoiceBuilder` (extends `TicketBuilder`)
- `invoiceHeader(company, customer)`: Appends structured headers.
- `itemRow(name, qty, price)`: Formats item descriptions and totals.
- `taxBlock(net, vat, total)`: Standard invoice summary block.

### `SiiReceiptBuilder` (extends `TicketBuilder`)
- `siiHeader(rut, corporateName)`: Chilean tax ticket header.
- `siiTimbre(data)`: Renders the SII electronic signature stamp.

---

## 4. Connections Namespace

All connections inherit from `ConnectionInterface` and implement:
- `connect()`
- `disconnect()`
- `send(bytes)`
- `isConnected()`

### `BluetoothConnection`
Web Bluetooth driver configured with Microchip service UUID (`49535343-fe7d-4ae5-8fa9-9fafd205e455`) and Write characteristic UUID (`49535343-8841-43f4-a8d4-ecbe34729bb3`). Performs automated MTU pacing (chunks of 100 bytes / 15ms delay).

---

## 5. Printer Profiles

Profiles determine command arrays for different brands:
- `EpsonProfile`: Standard ESC/POS commands.
- `XPrinterProfile`: XPrinter configuration overrides.
- `JP80Profile`: JP80H-UB customization.
- `SunmiProfile`: Portable tablet printers.
- `RongtaProfile`: Rongta configuration overrides.
