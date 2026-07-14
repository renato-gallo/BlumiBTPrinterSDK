import { CharsetEncoder } from "../src/encoding/CharsetEncoder.js";

/**
 * Prueba básica de calidad para los mapas de caracteres de CharsetEncoder.
 */
function testCharsetEncoder() {
  console.log("=== EJECUTANDO PRUEBAS DE CHARSETENCODER ===");

  const cases = [
    {
      text: "áéíóúñÑ",
      charset: "cp850",
      expected: [0xA0, 0x82, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5]
    },
    {
      text: "áéíóúñÑ",
      charset: "cp1252",
      expected: [0xE1, 0xE9, 0xED, 0xF3, 0xFA, 0xF1, 0xD1]
    },
    {
      text: "¡¿€",
      charset: "cp850",
      expected: [0xAD, 0xA8, 0xD5]
    },
    {
      text: "¡¿€",
      charset: "cp1252",
      expected: [0xA1, 0xBF, 0x80]
    }
  ];

  let passed = 0;
  for (const tc of cases) {
    const output = CharsetEncoder.encode(tc.text, tc.charset);
    const matches = output.length === tc.expected.length && 
                    Array.from(output).every((val, i) => val === tc.expected[i]);

    if (matches) {
      console.log(`[APROBADO] La codificación ${tc.charset.toUpperCase()} para "${tc.text}" coincide.`);
      passed++;
    } else {
      console.error(`[FALLIDO] La codificación ${tc.charset.toUpperCase()} para "${tc.text}" falló.`);
      console.error(`Esperado: [${tc.expected.map(x => '0x' + x.toString(16)).join(', ')}]`);
      console.error(`Obtenido: [${Array.from(output).map(x => '0x' + x.toString(16)).join(', ')}]`);
    }
  }

  console.log(`=== RESULTADOS DE CHARSETENCODER: ${passed}/${cases.length} APROBADAS ===\n`);

  // Probar normalización del español
  console.log("=== EJECUTANDO PRUEBAS DE NORMALIZACIÓN DE ESPAÑOL ===");
  const testNormInput = "¡Hola, señor y SEÑORA! ¿Cómo está él? 20º y 1ª.";
  const expectedNorm = "Hola, senor y SENORA! Como esta el? 20o y 1a.";
  const normOutput = CharsetEncoder.normalizeSpanish(testNormInput);
  if (normOutput === expectedNorm) {
    console.log(`[APROBADO] La salida de normalizeSpanish coincide: "${normOutput}"`);
    passed++;
  } else {
    console.error(`[FALLIDO] La salida de normalizeSpanish no coincide.`);
    console.error(`Esperado: "${expectedNorm}"`);
    console.error(`Obtenido: "${normOutput}"`);
  }

  return passed === (cases.length + 1);
}

// Ejecutar pruebas si se corre en Node directamente
if (typeof process !== 'undefined' && process.argv) {
  testCharsetEncoder();
}
export { testCharsetEncoder };
