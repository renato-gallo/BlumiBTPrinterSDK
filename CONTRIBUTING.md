# Contribuir al BLUMI Printer SDK

¡Gracias por mostrar interés en contribuir al desarrollo del **BLUMI Printer SDK**!
Para mantener un alto estándar de calidad del código y conservar la integridad arquitectónica de la librería, te pedimos leer y seguir estas directrices de desarrollo.

## Reglas de Desarrollo

1.  **ES Modules Estrictos**: Escribe todos los archivos de origen utilizando ES Modules puros (sintaxis `import`/`export`). No utilices CommonJS (`require`).
2.  **Arquitectura Modular**:
    *   Las capas de conexión física pertenecen a `src/connections/`.
    *   La compilación de comandos binarios pertenece a `src/core/EscPosEncoder.js`.
    *   Los diseños y diagramaciones de plantillas pertenecen a `src/templates/`.
    *   Las particularidades de códigos y anchos de caracteres de marcas pertenecen a `src/profiles/`.
3.  **Código Limpio (DRY)**: No dupliques comandos de bytes. Si un comando o lógica es común a varias impresoras, debe ubicarse en las clases base (`PrinterProfile` o `TicketBuilder`).
4.  **Estilo JSDoc**: Todas las clases, métodos, parámetros y tipos de retorno deben estar completamente documentados utilizando etiquetas JSDoc en español.
5.  **Entorno Limpio**: La librería nunca debe modificar los contextos globales de `window`, `navigator` o `document` fuera de funciones encapsuladas.

## Añadir un Perfil de Impresora

Para añadir soporte a un nuevo fabricante o modelo de impresora térmica:
1.  Crea un nuevo archivo en `src/profiles/MiPerfilDeImpresoraProfile.js`.
2.  Hereda de la clase base `PrinterProfile`.
3.  Anula u sobrescribe únicamente los comandos específicos donde el hardware difiera del estándar Epson ESC/POS (como `cut()`, `qr()` o las páginas de códigos soportadas `supportedCodePages`).
4.  Exporta el perfil en `src/profiles/index.js` o impórtalo en `BlumiPrinter.js`.

## Guía de Estilo de Código

-   Clases: `CamelCase` (ej. `BluetoothConnection`).
-   Métodos y variables: `camelCase` (ej. `isConnected`).
-   Constantes: `UPPER_SNAKE_CASE` (ej. `SERVICE_UUID`).
-   Formateo: Indentación de 2 espacios, uso obligatorio de punto y coma al final de las sentencias.

## Envío de Pull Requests

-   Incrementa la versión del paquete respetando las reglas de Semantic Versioning:
    *   **PATCH**: Corrección de fallos (sin romper compatibilidad).
    *   **MINOR**: Nuevas funcionalidades (compatibles hacia atrás).
    *   **MAJOR**: Cambios estructurales o que rompen compatibilidad.
-   Documenta todos los cambios bajo los títulos correspondientes (`Added`, `Changed`, `Fixed`, etc.) en el archivo `CHANGELOG.md`.
-   Mantenga actualizadas las tareas en `ROADMAP.md`.
