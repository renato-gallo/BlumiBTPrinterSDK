# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [3.3.0] - 2026-07-18

### Added
- **`WebUSBConnection.reconnectSaved()`**: Recupera la impresora USB previamente autorizada usando `navigator.usb.getDevices()` y reconecta directamente sin mostrar el diálogo de selección. No requiere `localStorage`; WebUSB persiste los permisos de forma nativa.
- **`WebSerialConnection.reconnectSaved()`**: Recupera el primer puerto COM previamente autorizado usando `navigator.serial.getPorts()` y reconecta directamente. No requiere `localStorage`; Web Serial persiste los permisos de forma nativa.
- **`WebSerialConnection` baudRate configurable**: El constructor ahora acepta `{ baudRate: number }` como opción (por defecto `9600`).

### Changed
- Refactorización interna de `WebUSBConnection` extrayendo `_openDevice()` y `_resetState()` para eliminar duplicación de código entre `connect()` y `reconnectSaved()`.
- Refactorización interna de `WebSerialConnection` extrayendo `_openPort()` y `_resetState()` de forma análoga.

## [3.2.0] - 2026-07-18

### Added
- **`reconnectSaved()`**: Nuevo método en `BluetoothConnection` que recupera el dispositivo previamente autorizado usando `navigator.bluetooth.getDevices()` y el ID guardado en `localStorage`, permitiendo reconexión en un solo clic tras recargar la página sin volver a mostrar el diálogo de escaneo.
- **Persistencia automática de dispositivo**: El método `connect()` ahora guarda automáticamente el ID del dispositivo Bluetooth en `localStorage` bajo la clave `blumi_ble_device_id` tras cada conexión exitosa.
- **`startKeepAlive(intervalMs)`**: Nuevo método que activa un pulso periódico de mantenimiento de canal BLE para prevenir que el firmware de la impresora o el S.O. rompan el enlace por inactividad. Intervalo configurable (por defecto 45 segundos).
- **`stopKeepAlive()`**: Nuevo método para desactivar el keep-alive de forma controlada. También se llama automáticamente al desconectar.

## [3.1.2] - 2026-07-14

### Changed
- **Documentación del Sistema de Conexiones**: Se agregaron ejemplos de código detallados e instrucciones para inicializar la impresora utilizando los nuevos drivers de WebUSB, WebSerial y NetworkConnection tanto en `README.md` como en `API.md`.

## [3.1.0] - 2026-07-14

### Added
- **Controlador WebUSB**: Implementación concreta del driver de conexión física `WebUSBConnection` para imprimir directamente por USB desde navegadores que lo soporten (como Chrome/Edge) sin necesidad de software puente.
- **Controlador WebSerial**: Implementación concreta del driver de conexión física `WebSerialConnection` para comunicar con impresoras térmicas conectadas a puertos COM serie.
- **Controlador de Red TCP/IP (WiFi/Ethernet)**: Creación del driver `NetworkConnection` compatible nativamente con entornos híbridos (Tauri, Electron y Node.js) que se conecta directamente por sockets de red en el puerto 9100.

## [3.0.0] - 2026-07-14

### Added
- **Localización Completa a Español**: Traducción de todos los comentarios de código, documentación JSDoc, advertencias en consola y mensajes de error al español latinoamericano.
- **Documentación en Español**: Traducción de los archivos `README.md`, `API.md`, `CONTRIBUTING.md` y `ROADMAP.md` a español.
- **Métodos de Impresión de Plantillas en BlumiPrinter**: Se expusieron los métodos `receipt()`, `openFactura()` y `siiReceipt()` en la clase principal `BlumiPrinter` para facilitar la invocación directa de constructores semánticos desde el frontend.

## [2.0.0] - 2026-07-14

### Added

- **Modular Architecture**: Complete separation of Connections, Core compiler, Encoding, Image processing, Queue management, Printer Profiles, and Document templates.
- **Dynamic Connection Backends**: Introduced `ConnectionInterface` with concrete implementations for `BluetoothConnection`, and stubs for `WebUSBConnection` and `WebSerialConnection`.
- **Hardware Profiles**: Created `PrinterProfile`, `EpsonProfile`, `XPrinterProfile`, `JP80Profile`, `SunmiProfile`, `RongtaProfile`, and `GPrinterProfile` to manage specific command variations, widths, and drawer kicks.
- **Extended Code Pages**: Support for 14 code tables (CP437, CP850, CP852, CP858, CP860, CP863, CP865, CP866, CP1250, CP1251, CP1252, ISO-8859-1, ISO-8859-15, GB18030).
- **Advanced Dithering Algorithms**: Added Floyd-Steinberg, Atkinson, Bayer 4x4, and Thresholding algorithms in the `ImageProcessor`.
- **Semantic Templates**: Added document-specific builders including `InvoiceBuilder`, `ReceiptBuilder`, `KitchenBuilder`, `OpenFacturaBuilder`, `SiiReceiptBuilder`, and `DeliveryBuilder`.
- **Interactive PWA Dashboard**: Rebuilt `index.html` as a premium developer console with live logs, profile selectors, dithering pre-rendering, and template previews.
- **Example Codes & Tests**: Added standard samples and test skeletons for quality verification.
- **Spanish Sanitization Option**: Added `sanitizeSpanish` constructor/compiler option. When enabled, it dynamically normalizes accented vowels (`á`->`a`), `ñ`/`Ñ` to `n`/`N`, and strips opening marks (`¿`/`¡`) to support Chinese OEM firmware-locked printers that only print 7-bit ASCII.

### Changed

- Refactored entire codebase from monolithic single files to standard ES Modules.
- Changed builder callbacks from raw ESC/POS commands to high-level semantic profiles.

### Fixed

- Handled potential buffer overflows on cheap printer BLE receivers by adding MTU chunk pacing to connections.
- Fixed BLE device search in Chrome/Android: replaced strict UUID service filters with `acceptAllDevices: true` to support thermal printers that do not advertise custom service UUIDs.
- Fixed GATT write lockups: prioritized write with response methods (`writeValueWithResponse` / `writeValue`) over write without response. This enforces GATT backpressure acknowledgment and stops Android/Chrome GATT connection freezes during consecutive printing.
- Fixed demo dashboard configuration drops: replaced the destructive instantiation of `BlumiPrinter` inside `initPrinter()` with hot-reloaded configuration updates, preventing BLE connection drops when selecting different printer models or character pages in `index.html`.
- Fixed `normalizeSpanish` character matching: added uppercase `Ñ` to the regular expression character class to ensure it is correctly normalized to `N` when `sanitizeSpanish` is enabled.
