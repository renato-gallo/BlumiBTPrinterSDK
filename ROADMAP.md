# Roadmap - BLUMI Printer SDK

Project development roadmap and planned features.

## [2.1.0] - Planned Q3 2026

### Features

- [ ] **PDF417 Barcode Support**: Enable PDF417 native print commands inside profiles.
- [ ] **Code128 Barcode Enhancements**: Add custom subsets (A/B/C) support for Code128 barcoding.
- [ ] **Cash Drawer Integration**: Implement automatic kick-out commands matching the hardware pins (e.g. Pin 2 / Pin 5).
- [ ] **Image Cache**: Add an in-memory dither cache to prevent re-processing identical logo blobs in long queues.

## [2.2.0] - Planned Q4 2026

### Interfaces & Profiles

- [ ] **WebUSB Connection Backend**: Full implementation of the `WebUSBConnection` driver for direct USB printing in secure browsers.
- [ ] **WebSerial Connection Backend**: Full implementation of the `WebSerialConnection` driver for serial COM ports.
- [ ] **Custom Epson Profile**: Support for advanced Epson TM series status notifications.

## [3.0.0] - Future Target

### Architecture

- [ ] **Plugin System**: Allow third-party packages to hook into the `TicketBuilder` pipeline.
- [ ] **Cloud Printing Gateway**: Provide an HTTP/WebSocket tunnel wrapper class.
- [ ] **Network/TCP Discovery**: Add network UDP broadcast device discovery.
