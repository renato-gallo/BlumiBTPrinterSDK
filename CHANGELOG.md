# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
