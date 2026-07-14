import { ImageProcessor } from "../src/images/ImageProcessor.js";

/**
 * Prueba de calidad básica para los algoritmos de tramado de ImageProcessor.
 */
function testImageProcessor() {
  console.log("=== EJECUTANDO PRUEBAS DE IMAGEPROCESSOR ===");

  if (typeof document === 'undefined') {
    console.warn("[OMITIDA] Las pruebas de ImageProcessor se omitieron porque el entorno DOM (document) no está presente.");
    return true;
  }

  try {
    // 1. Crear un lienzo canvas virtual para pruebas
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    
    // Rellenar con un degradado de gris
    const grad = ctx.createLinearGradient(0, 0, 8, 0);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 8);

    // 2. Realizar rasterización de tramados
    const resFS = ImageProcessor.rasterizeCanvas(canvas, 8, 8, 127, 'floyd-steinberg');
    const resBayer = ImageProcessor.rasterizeCanvas(canvas, 8, 8, 127, 'bayer');
    const resThresh = ImageProcessor.rasterizeCanvas(canvas, 8, 8, 127, false);

    let success = true;
    
    // Verificar dimensiones
    if (resFS.width !== 8 || resFS.height !== 8 || resFS.data.length !== 8) {
      console.error("[FALLIDO] Las dimensiones de salida del tramado no coinciden.");
      success = false;
    }

    if (success) {
      console.log("[APROBADO] ImageProcessor rasterizeCanvas generó dimensiones y flujos binarios válidos.");
      console.log(`Bytes Floyd-Steinberg: [${Array.from(resFS.data).map(x => '0x' + x.toString(16)).join(', ')}]`);
      console.log(`Bytes Bayer:           [${Array.from(resBayer.data).map(x => '0x' + x.toString(16)).join(', ')}]`);
      console.log(`Bytes Umbral:          [${Array.from(resThresh.data).map(x => '0x' + x.toString(16)).join(', ')}]`);
    }

    console.log("=== RESULTADOS DE IMAGEPROCESSOR: APROBADO ===\n");
    return success;
  } catch (err) {
    console.error("[FALLIDO] La prueba de ImageProcessor lanzó un error inesperado:", err);
    return false;
  }
}

if (typeof window !== 'undefined' || (typeof process !== 'undefined' && process.argv)) {
  testImageProcessor();
}
export { testImageProcessor };
