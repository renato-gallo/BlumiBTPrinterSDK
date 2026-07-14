# BLUMI Printer SDK - Referencia de la API

Referencia completa de clases y métodos de la librería **BLUMI Printer SDK**.

---

## 1. BlumiPrinter

La clase principal que coordina las conexiones, los perfiles de hardware activos, la serialización de tareas de impresión y las plantillas de documentos.

### `constructor(options = {})`
- `options.profile`: Instancia de perfil de hardware. Por defecto `new EpsonProfile()`.
- `options.connection`: Instancia del controlador de conexión. Por defecto `new BluetoothConnection()`.
- `options.characterWidth`: Límite de caracteres por línea. Por defecto el estándar del perfil (48).
- `options.charset`: Juego de caracteres predeterminado. Por defecto `'cp850'`.
- `options.sanitizeSpanish`: Booleano para activar la normalización de caracteres del español a ASCII de 7 bits. Por defecto `false`.

### `async connect()`
Despliega la ventana de emparejamiento nativa y conecta a la impresora mediante GATT/USB/Serie.

### `async disconnect()`
Cierra la conexión activa actual con el dispositivo de hardware.

### `async reconnect()`
Intenta recuperar de forma automática la conexión con el último dispositivo emparejado.

### `status()`
Retorna un objeto con banderas y detalles del estado de conexión: `{ connected: boolean, reconnecting: boolean, device: { name, id } }`.

### `async ticket(callback)`
Construye e imprime un ticket básico mediante `TicketBuilder`.
- `callback(ticket)`: Función que recibe una instancia de `TicketBuilder`.

### `async invoice(callback)`
Construye e imprime una factura mediante `InvoiceBuilder`.
- `callback(invoice)`: Función que recibe una instancia de `InvoiceBuilder`.

### `async kitchen(callback)`
Construye e imprime una comanda de cocina mediante `KitchenBuilder`.
- `callback(kitchen)`: Función que recibe una instancia de `KitchenBuilder`.

### `async delivery(callback)`
Construye e imprime un vale de entrega mediante `DeliveryBuilder`.
- `callback(delivery)`: Función que recibe una instancia de `DeliveryBuilder`.

### `async receipt(callback)`
Construye e imprime una boleta o recibo estándar mediante `ReceiptBuilder`.
- `callback(receipt)`: Función que recibe una instancia de `ReceiptBuilder`.

### `async openFactura(callback)`
Construye e imprime un comprobante compatible con OpenFactura mediante `OpenFacturaBuilder`.
- `callback(openFactura)`: Función que recibe una instancia de `OpenFacturaBuilder`.

### `async siiReceipt(callback)`
Construye e imprime una boleta oficial regulada por el SII de Chile mediante `SiiReceiptBuilder`.
- `callback(siiReceipt)`: Función que recibe una instancia de `SiiReceiptBuilder`.

---

## 2. TicketBuilder

El constructor de plantillas semánticas base. Expone métodos encadenables para diagramar comprobantes.

### `text(string)`
Añade una línea de texto plano (aplica automáticamente el salto de línea `\n` final).

### `bold(enabled = true)`
Habilita o deshabilita la impresión en negrita.

### `underline(level = true)`
Habilita o deshabilita el subrayado (puede ser booleano o valor numérico de grosor 0-2).

### `reverse(enabled = true)`
Habilita o deshabilita el modo inverso (blanco sobre negro).

### `rotation(enabled = true)`
Habilita o deshabilita la rotación de caracteres en 90 grados.

### `align(position)`
Alinea el texto: `'left'`, `'center'` o `'right'`.

### `center()`, `left()`, `right()`
Alineaciones rápidas directas.

### `size(width, height)`
Modifica la escala del texto (multiplicadores de ancho y alto de 1 a 8).

### `line(char = '-')`
Imprime una línea horizontal de caracteres repetidos abarcando el ancho del papel.

### `row(left, right)`
Genera una fila con dos columnas alineadas a los extremos (izquierdo y derecho) con ajuste automático de espacio intermedio.

### `total(value)`
Inserta un bloque de totales destacado y envuelto en doble línea horizontal.

### `qr(url, size = 6, ec = 'M')`
Inserta un código QR centrado nativo.

### `async image(source, options = {})`
Carga y rasteriza una imagen de forma asíncrona.
- `options.width`: Ancho final de salida en píxeles (múltiplos de 8).
- `options.threshold`: Valor de umbralización de blanco/negro (0-255).
- `options.dither`: Algoritmo de tramado: `'floyd-steinberg'`, `'atkinson'`, `'bayer'` o `false` (por defecto umbral clásico).

### `feed(lines = 1)`
Avanza el papel el número de líneas indicado.

### `cut(partial = false)`
Envía la orden física de corte de papel (completo o parcial).

---

## 3. Constructores Especializados

### `ReceiptBuilder` (extiende de `TicketBuilder`)
- `receiptHeader(title, subtitle, address)`: Añade bloques de dirección y comercio.
- `item(name, qty, price)`: Formatea filas de ítems con totales de línea.
- `summary(subtotal, tax, total)`: Resumen del comprobante de ventas con IVA.
- `footer(msg)`: Mensaje de pie de página centrado.

### `OpenFacturaBuilder` (extiende de `TicketBuilder`)
- `openFacturaHeader(title, companyRut, docNum)`: Cabecera formal de OpenFactura con Rut.
- `reference(docType, docNum, date)`: Sección de documentos de referencia relacionados.

### `SiiReceiptBuilder` (extiende de `TicketBuilder`)
- `siiHeader(rut, companyName, activity, address, resolutionNum, resolutionYear)`: Bloque formal regulado por el SII de Chile.
- `siiTimbre(signatureData, options)`: Renderiza el Timbre Electrónico del SII mediante PDF417 nativo o código QR de verificación.

---

## 4. Controladores de Conexión

Todos los drivers heredan de la clase abstracta `ConnectionInterface` e implementan la interfaz común de operaciones:
*   `connect()`: Inicia el diálogo de vinculación física o establece la comunicación. Retorna `Promise<boolean>`.
*   `disconnect()`: Cierra el puerto/socket liberando los recursos de hardware de forma ordenada. Retorna `Promise<void>`.
*   `send(bytes)`: Escribe un arreglo binario `Uint8Array` en el canal de salida activo. Retorna `Promise<void>`.
*   `isConnected()`: Verifica y retorna el estado lógico del canal de conexión (`boolean`).

### `BluetoothConnection`
Driver Web Bluetooth para impresoras BLE. Utiliza por defecto el UUID de servicio Microchip (`49535343-fe7d-4ae5-8fa9-9fafd205e455`) y característica de escritura (`49535343-8841-43f4-a8d4-ecbe34729bb3`). Realiza fraccionamiento (MTU pacing) en paquetes de 100 bytes con 15ms de retraso de forma interna para evitar desbordamientos y bloqueos de GATT.

### `WebUSBConnection`
Driver WebUSB compatible con navegadores Chromium (Chrome/Edge). Filtra dispositivos emparejados mediante la clase de impresora universal `0x07`. Localiza de forma dinámica la interfaz bulk OUT activa del fabricante del hardware y fracciona la escritura en bloques de 64 bytes (estándar USB bulk).

### `WebSerialConnection`
Driver Web Serial API para conexiones serie a través de adaptadores RS232 o conversores USB-a-Serie. Se conecta utilizando la velocidad estándar del hardware serie (`baudRate: 9600`) y opera mediante flujos de corrientes de escritura nativos (`WritableStream`).

### `NetworkConnection`
Driver TCP Raw Socket para impresoras de red locales mediante cable Ethernet o WiFi en el puerto `9100`.
- `constructor(host, port)`: Permite indicar la dirección IP (por defecto `192.168.1.100`) y puerto (por defecto `9100`).
- **Compatibilidad**: Diseñado para integrarse nativamente en entornos Electron, Tauri y Node.js importando de forma dinámica el módulo `'net'`. Lanza un error controlado si es invocado en entornos de navegadores web puros debido a restricciones del Sandbox de red.

---

## 5. Perfiles de Impresoras

Los perfiles traducen las directivas semánticas a secuencias binarias ESC/POS de marcas:
- `EpsonProfile`: Comandos estándar ESC/POS y dimensiones de 80mm (48 columnas).
- `XPrinterProfile`: Adaptación para impresoras de marca XPrinter.
- `JP80Profile`: Ajustes para modelo JP80H-UB.
- `SunmiProfile`: Modificaciones para terminales portátiles Sunmi (papel de 58mm, corte simulado mediante avance).
- `RongtaProfile` y `GPrinterProfile`: Ajustes finos para impresoras marca Rongta y GPrinter.
