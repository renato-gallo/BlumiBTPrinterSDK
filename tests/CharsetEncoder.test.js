import { CharsetEncoder } from "../src/encoding/CharsetEncoder.js";

/**
 * Basic quality test for CharsetEncoder character maps.
 */
function testCharsetEncoder() {
  console.log("=== RUNNING CHARSETENCODER TESTS ===");

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
      console.log(`[PASS] Charset ${tc.charset.toUpperCase()} encoding for "${tc.text}" matches.`);
      passed++;
    } else {
      console.error(`[FAIL] Charset ${tc.charset.toUpperCase()} encoding for "${tc.text}" failed.`);
      console.error(`Expected: [${tc.expected.map(x => '0x' + x.toString(16)).join(', ')}]`);
      console.error(`Got:      [${Array.from(output).map(x => '0x' + x.toString(16)).join(', ')}]`);
    }
  }

  console.log(`=== CHARSETENCODER RESULTS: ${passed}/${cases.length} PASSED ===\n`);

  // Test Spanish normalization
  console.log("=== RUNNING SPANISH NORMALIZATION TESTS ===");
  const testNormInput = "¡Hola, señor! ¿Cómo está él? 20º y 1ª.";
  const expectedNorm = "Hola, senor! Como esta el? 20o y 1a.";
  const normOutput = CharsetEncoder.normalizeSpanish(testNormInput);
  if (normOutput === expectedNorm) {
    console.log(`[PASS] normalizeSpanish output matches: "${normOutput}"`);
    passed++;
  } else {
    console.error(`[FAIL] normalizeSpanish output mismatch.`);
    console.error(`Expected: "${expectedNorm}"`);
    console.error(`Got:      "${normOutput}"`);
  }

  return passed === (cases.length + 1);
}

// Execute tests if running in direct Node/Browser script environment
if (typeof process !== 'undefined' && process.argv) {
  testCharsetEncoder();
}
export { testCharsetEncoder };
