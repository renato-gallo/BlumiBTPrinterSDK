# Contributing to BLUMI Printer SDK

Thank you for showing interest in contributing to the **BLUMI Printer SDK**! 
To maintain a high level of code quality and architectural integrity, please read and follow these guidelines.

## Development Rules

1. **Strict ES Modules**: Write all source files as pure ES Modules (`import`/`export` syntax). Do not use CommonJS (`require`).
2. **Modular Architecture**:
   - Connection layers belong in `src/connections/`.
   - Command compilation belongs in `src/core/EscPosEncoder.js`.
   - Layout patterns belong in `src/templates/`.
   - Printer-specific codes and widths belong in `src/profiles/`.
3. **No Duplicated Logic (DRY)**: Do not duplicate byte compiling commands. If a command is shared, it must sit in the base classes (`PrinterProfile` or `TicketBuilder`).
4. **JSDoc Style**: All classes, methods, parameters, and return types must be fully documented using JSDoc.
5. **No Globals**: The library must never modify the global window, navigator, or document contexts outside encapsulated functions.

## Adding a Printer Profile

To support a new printer model:
1. Create a file `src/profiles/YourPrinterProfile.js`.
2. Extend `PrinterProfile`.
3. Override only the specific commands where the hardware deviates from standard Epson ESC/POS (e.g. `cut()`, `qr()`, or `supportedCodePages`).
4. Export the profile in `src/profiles/index.js` or import it in `BlumiPrinter.js`.

## Code Style Guide

- Class naming: `CamelCase` (e.g., `BluetoothConnection`).
- Method/Variable naming: `camelCase` (e.g., `isConnected`).
- Constant naming: `UPPER_SNAKE_CASE` (e.g., `SERVICE_UUID`).
- Formatting: 2-space indentation, semicolons required.

## Submitting Pull Requests

- Increase the version number according to Semantic Versioning rules:
  - **PATCH**: Bug fixes (non-breaking).
  - **MINOR**: New features (non-breaking, backward compatible).
  - **MAJOR**: Structural/breaking changes.
- Document all changes under the appropriate headers (`Added`, `Changed`, `Fixed`, etc.) in `CHANGELOG.md`.
- Keep tasks up-to-date in `ROADMAP.md`.
