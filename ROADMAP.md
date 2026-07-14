# Hoja de Ruta (Roadmap) - BLUMI Printer SDK

Hoja de ruta del desarrollo del proyecto y características planificadas.

## [2.1.0] - Completado (Versión Actual)

### Características
- [x] **Soporte de Código de Barras PDF417**: Comandos nativos de impresión de símbolos PDF417 integrados en los perfiles.
- [x] **Mejoras en Código de Barras Code128**: Soporte para subconjuntos (A/B/C) personalizados en códigos de barras de 1D.
- [x] **Integración de Cajón Portamonedas**: Comandos de apertura automática según pines de hardware (Pin 2 / Pin 5).
- [ ] **Caché de Imágenes**: Sistema de caché de tramado en memoria para evitar reprocesar la misma imagen o logotipo en colas largas.

## [2.2.0] - Planificado Q4 2026

### Canales y Perfiles de Conexión
- [ ] **Controlador de Conexión WebUSB**: Implementación completa del driver `WebUSBConnection` para impresión USB directa en navegadores seguros.
- [ ] **Controlador de Conexión WebSerial**: Implementación completa del driver `WebSerialConnection` para puertos COM serie.
- [ ] **Perfil Avanzado Epson**: Soporte de lectura de estados de papel de la serie Epson TM.

## [3.0.0] - Versión Futura

### Arquitectura
- [ ] **Sistema de Plugins**: Permitir que paquetes de terceros se acoplen a la cola de transformación del `TicketBuilder`.
- [ ] **Impresión en la Nube (Cloud Printing Gateway)**: Proporcionar una clase contenedora para túneles HTTP/WebSocket.
- [ ] **Descubrimiento de Red/TCP**: Añadir búsqueda de dispositivos mediante difusión UDP en red local.
