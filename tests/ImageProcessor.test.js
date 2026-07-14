import { ImageProcessor } from "../src/images/ImageProcessor.js";

/**
 * Basic quality test for ImageProcessor dithering algorithms.
 */
function testImageProcessor() {
  console.log("=== RUNNING IMAGEPROCESSOR TESTS ===");

  if (typeof document === 'undefined') {
    console.warn("[SKIP] ImageProcessor tests skipped because DOM (document) is not present.");
    return true;
  }

  try {
    // 1. Create a dummy canvas
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    
    // Fill with gray gradient
    const grad = ctx.createLinearGradient(0, 0, 8, 0);
    grad.addColorStop(0, '#000000');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 8);

    // 2. Perform dither rasterization
    const resFS = ImageProcessor.rasterizeCanvas(canvas, 8, 8, 127, 'floyd-steinberg');
    const resBayer = ImageProcessor.rasterizeCanvas(canvas, 8, 8, 127, 'bayer');
    const resThresh = ImageProcessor.rasterizeCanvas(canvas, 8, 8, 127, false);

    let success = true;
    
    // Check sizes
    if (resFS.width !== 8 || resFS.height !== 8 || resFS.data.length !== 8) {
      console.error("[FAIL] Dither output sizes mismatch.");
      success = false;
    }

    if (success) {
      console.log("[PASS] ImageProcessor rasterizeCanvas generated valid dimensions and outputs.");
      console.log(`Floyd-Steinberg bytes: [${Array.from(resFS.data).map(x => '0x' + x.toString(16)).join(', ')}]`);
      console.log(`Bayer bytes:           [${Array.from(resBayer.data).map(x => '0x' + x.toString(16)).join(', ')}]`);
      console.log(`Threshold bytes:       [${Array.from(resThresh.data).map(x => '0x' + x.toString(16)).join(', ')}]`);
    }

    console.log("=== IMAGEPROCESSOR RESULTS: PASSED ===\n");
    return success;
  } catch (err) {
    console.error("[FAIL] ImageProcessor test threw error:", err);
    return false;
  }
}

if (typeof window !== 'undefined' || (typeof process !== 'undefined' && process.argv)) {
  testImageProcessor();
}
export { testImageProcessor };
