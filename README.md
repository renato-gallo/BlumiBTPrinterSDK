# BLUMI Printer SDK

Una librería JavaScript premium, modular y extensible basada en ES Modules para la impresión de recibos térmicos mediante ESC/POS utilizando las APIs de Web Bluetooth (BLE), WebUSB y Web Serial.

## Características

- **Arquitectura Desacoplada**: Separación limpia entre la capa de conexión física, la compilación de comandos y la generación semántica de documentos.
- **Perfiles de Hardware**: Reglas de comportamiento y adaptaciones de comandos específicas para múltiples marcas (`Epson`, `XPrinter`, `JP80`, `Sunmi`, `Rongta`, `GPrinter`) sin mezclar código lógico en las aplicaciones.
- **Soporte Multi-Juego de Caracteres**: Tablas de traducción binaria optimizadas para CP437, CP850, CP858, CP1252 y más de 10 páginas de códigos adicionales.
- **Respaldo de Renderizado UTF-8**: Imprime textos complejos, emojis o idiomas no soportados por el hardware rasterizando automáticamente el texto en un lienzo (canvas) virtual en segundo plano.
- **Tramado Avanzado de Imágenes**: Convierte imágenes PNG/JPG/WEBP/SVG en flujos de bits monocromáticos usando algoritmos de Floyd-Steinberg, Atkinson, Ordered Bayer 4x4 y umbralización clásica.
- **Plantillas Semánticas**: Genera fácilmente documentos profesionales como Boletas, Facturas, Comandas de cocina, Vales de despacho y comprobantes oficiales compatibles con el S.I.I. de Chile y OpenFactura sin tener que escribir comandos ESC/POS manuales.
- **Dosificación de Conexión (BLE Chunking)**: Fragmentación secuencial de paquetes según el MTU del dispositivo para evitar pérdidas de datos o desbordamiento en receptores BLE de impresoras de bajo costo.

## Instalación

Este SDK está estructurado como ES Modules estándar y está preparado para integrarse en PWA, proyectos web locales, entornos Tauri y aplicaciones Electron.

```javascript
import { BlumiPrinter } from './src/core/BlumiPrinter.js';
import { JP80Profile } from './src/profiles/JP80Profile.js';
```

## Inicio Rápido

```javascript
// Instanciar la impresora con un perfil de hardware específico
const impresora = new BlumiPrinter({
  profile: new JP80Profile(),
  characterWidth: 48,
  charset: 'cp850'
});

// Desplegar diálogo del navegador y conectar por Bluetooth BLE
await impresora.connect();

// Compilar e imprimir una boleta usando una plantilla semántica
await impresora.ticket(async (ticket) => {
  await ticket.image('logo.png', { dither: true });
  
  ticket.center()
        .bold(true)
        .text("MUNDO BAREFOOT")
        .bold(false)
        .line()
        .row("Zapato Respetuoso Providencia", "$64.990")
        .total("$64.990")
        .qr("https://mundobarefoot.cl")
        .feed(3)
        .cut();
});
```

## Estructura de Carpetas

```
├── examples/              # Demos de uso y fragmentos de código de prueba
├── tests/                 # Suite de pruebas unitarias para codificación y procesamiento
├── src/
│   ├── core/              # Orquestador del SDK y compiladores de comandos ESC/POS
│   ├── connections/       # Controladores de WebBluetooth, WebUSB y WebSerial
│   ├── profiles/          # Reglas de comportamiento de hardware específicas de fabricantes
│   ├── encoding/          # Traducciones y codificación de caracteres a bytes
│   ├── images/            # Algoritmos de tramado y redimensionado de imágenes
│   ├── queue/             # Planificador y cola de tareas de impresión
│   ├── templates/         # Constructores de Boletas, Facturas, Cocina, Envíos y SII
│   └── utils/             # Funciones auxiliares de carga binaria e imágenes
```

## Documentación

Para ver los parámetros detallados de los métodos y clases, consulta la guía [API.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/API.md).
Para contribuir con el desarrollo del SDK, lee [CONTRIBUTING.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/CONTRIBUTING.md).
Sigue las correcciones y versiones en [CHANGELOG.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/CHANGELOG.md) y consulta la hoja de ruta de la librería en [ROADMAP.md](file:///c:/Users/Windows%2010%20Pro/Desktop/Clientes/MundoBarefoot/ROADMAP.md).
