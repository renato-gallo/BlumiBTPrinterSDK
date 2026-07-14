/**
 * High-performance Character Set Encoding Engine.
 * Translates JavaScript UTF-16 strings into single-byte representations for 14+ code pages.
 */
export class CharsetEncoder {
  // 128-character lookup strings mapping index 0-127 to bytes 128-255.
  static CODE_PAGES = {
    'cp437': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp850': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ",
    
    'cp852': "ÇüéâäàćçłëŐőîŹÄĆÉĹĺôöĽľŚśÖÜŤťŁ×čáíóúąĄĘęłŚŚťŤźŽˉ˘Ł¤ďĐĎĘd'ĹĎ§÷¸°¨˙űŘř■ ",
    
    // CP858 is identical to CP850 except byte 213 (0xD5) is Euro '€' instead of dotless 'ı'
    'cp858': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈ€ÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ",
    
    'cp860': "ÇüéâãàÁçêêèÍÔìÃÅÉÊÆôõòÚùÝÖÜ¢£¥₧́áíóúñÑªº¿Ò¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp863': "ÇüéâÂà¶çêëèïî═À§ÉœŒôëòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼§«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp865': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp866': "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ",
    
    'cp1250': "€ ‚„…†‡  ‰Š‹ŚŤŽŹ  ‘’“”•–—  ™š›śťžź ˇ˘Ł¤Ą¦§¨©Ş«¬®Ż°±˛ł´µ¶·¸ąºş»Ľ˝ľż",
    
    'cp1251': "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя",
    
    'cp1252': "€ ‚ƒ„…†‡ˆ‰Š‹Œ Ž  ‘’“”•–—˜™š›œ žŸ ¡¢£¤¥¦§¨©ª«¬\xad®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    
    // ISO-8859-1 uses standard 160-255 mapping directly (128-159 are control chars and empty in ISO)
    'iso8859-1': " ¡¢£¤¥¦§¨©ª«¬\xad®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    
    // ISO-8859-15 is similar to ISO-8859-1 with minor changes (Euro symbol, etc.)
    'iso8859-15': " ¡¢£€¥Š§š©ª«¬\xad®¯°±²³Žµ¶·ž¹º»ŒœŸ¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",

    // GB18030 placeholder lookup (handles common punctuation, digits, ASCII)
    'gb18030': ""
  };

  /**
   * Translates a string into a byte array (Uint8Array) for the target code page.
   * Unsupported characters are replaced with the '?' (0x3F) character.
   * 
   * @param {string} text - The input string to encode.
   * @param {string} [charset='cp850'] - The target character set.
   * @returns {Uint8Array} The encoded byte array.
   */
  static encode(text, charset = 'cp850') {
    const target = charset.toLowerCase();
    const result = new Uint8Array(text.length);

    // If GB18030 and TextEncoder is available, we try to use native encoding (usually browser dependent)
    if (target === 'gb18030' || target === 'gbk') {
      try {
        // Modern runtimes with full TextEncoder support might throw if not supporting legacy
        const encoder = new TextEncoder(target);
        return encoder.encode(text);
      } catch (e) {
        // Fall back to mapping common ASCII, otherwise ignore double-byte conversion
        console.warn(`Native encoder for ${charset} is not available. Falling back to ASCII extraction.`);
      }
    }

    const lookup = this.CODE_PAGES[target] || this.CODE_PAGES['cp850'];
    const isIso = target.startsWith('iso');
    const startByte = isIso ? 160 : 128; // ISO encodings start mapping at byte 160

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);

      if (code < 128) {
        // Standard ASCII
        result[i] = code;
      } else if (char === '€' && target === 'cp850') {
        // Manual override for CP850 euro symbol (mapped to 0xD5 in customized ESC/POS code pages)
        result[i] = 0xD5;
      } else {
        const idx = lookup.indexOf(char);
        if (idx !== -1) {
          result[i] = startByte + idx;
        } else {
          // Fallback to '?'
          result[i] = 0x3F;
        }
      }
    }

    return result;
  }

  /**
   * Normalizes Spanish accented characters, eñes, and opening punctuation
   * to their standard 7-bit ASCII equivalents.
   * 
   * @param {string} text - The input text to normalize.
   * @returns {string} The normalized text.
   */
  static normalizeSpanish(text) {
    const map = {
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
      'ñ': 'n', 'Ñ': 'N',
      'ü': 'u', 'Ü': 'U',
      '¿': '',  '¡': '',
      'º': 'o', 'ª': 'a'
    };
    return text.replace(/[áéíóúñÑÁÉÍÓÚüÜ¿¡ºª]/g, char => map[char] !== undefined ? map[char] : char);
  }
}
