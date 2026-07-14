# BLUMI Printer SDK

A premium, modular, and extensible JavaScript ES6 library for ESC/POS thermal receipt printing using Web Bluetooth (BLE), WebUSB, and Web Serial APIs.

## Features

- **Decoupled Architecture**: Separation of connection layer, command compilation, and document generation.
- **Hardware Profiles**: Custom behavior definitions for different printers (`Epson`, `XPrinter`, `JP80`, `Sunmi`, `Rongta`, `GPrinter`) without mixing logic.
- **Multi-Charset Support**: Translation maps for CP437, CP850, CP858, CP1252, and 10+ other code tables.
- **UTF-8 Canvas Fallback**: Prints advanced text layouts or unsupported languages by automatically rasterizing text onto offscreen canvases.
- **Advanced Dithering**: Converts PNG/JPG/WEBP/SVG images to monochrome bit streams using Floyd-Steinberg, Atkinson, Bayer 4x4, and thresholding algorithms.
- **Semantic Templates**: Generate standard documents like Invoices, Kitchen order slips, and Chilean SII-compliant tax receipts easily without writing ESC/POS codes.
- **Connection Pacing (BLE Chunking)**: Sequential MTU chunk splitting prevents buffer overflow crashes on low-cost thermal printer BLE receivers.

## Installation

This SDK is packaged as standard ES Modules and is ready for PWA, local HTML imports, Tauri, and Electron environments.

```javascript
import { BlumiPrinter } from './src/core/BlumiPrinter.js';
import { JP80Profile } from './src/profiles/JP80Profile.js';
```

## Quick Start

```javascript
// Instantiate printer with a specific profile
const printer = new BlumiPrinter({
  profile: new JP80Profile(),
  characterWidth: 48,
  charset: 'cp850'
});

// Prompt pairing window and establish BLE connection
await printer.connect();

// Build and print a receipt using a semantic template
await printer.ticket(async (ticket) => {
  await ticket.image('logo.png', { dither: true });
  
  ticket.center()
        .bold(true)
        .text("BLUMI SPA")
        .bold(false)
        .line()
        .row("Premium Software Solution", "$99.990")
        .total("$99.990")
        .qr("https://blumi.cl")
        .feed(3)
        .cut();
});
```

## Folder Structure

```
├── examples/              # Usage demos and code snippets
├── tests/                 # Testing suites for encoders and processors
├── src/
│   ├── core/              # Orchestrator and ESC/POS command compilers
│   ├── connections/       # WebBluetooth, WebUSB, and WebSerial drivers
│   ├── profiles/          # Vendor hardware behavior rules
│   ├── encoding/          # Character code pages translations
│   ├── images/            # Image dithering and scaling
│   ├── queue/             # Printing queue scheduler
│   ├── templates/         # Invoice, Kitchen, Delivery, and SII Builders
│   └── utils/             # Binary helpers and image loading utilities
```

## Documentation

For full parameters and API details, check [API.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/API.md).
To participate in development, see [CONTRIBUTING.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/CONTRIBUTING.md).
Follow updates in [CHANGELOG.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/CHANGELOG.md) and see upcoming work in [ROADMAP.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/ROADMAP.md).
