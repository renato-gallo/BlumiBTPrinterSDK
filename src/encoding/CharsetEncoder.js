/**
 * Motor de Codificación de Juegos de Caracteres de alto rendimiento.
 * Traduce cadenas JavaScript UTF-16 a representaciones de un solo byte para más de 14 tablas de códigos (code pages).
 */
export class CharsetEncoder {
  // Cadenas de búsqueda de 128 caracteres que asignan el índice 0-127 a los bytes 128-255.
  static CODE_PAGES = {
    'cp437': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp850': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ",
    
    'cp852': "ÇüéâäàćçłëŐőîŹÄĆÉĹĺôöĽľŚśÖÜŤťŁ×čáíóúąĄĘęłŚŚťŤźŽˉ˘Ł¤ďĐĎĘd'ĹĎ§÷¸°¨˙űŘř■ ",
    
    // CP858 es idéntica a CP850 excepto que el byte 213 (0xD5) es el símbolo Euro '€' en lugar de la 'ı' sin punto
    'cp858': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈ€ÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ ",
    
    'cp860': "ÇüéâãàÁçêêèÍÔìÃÅÉÊÆôõòÚùÝÖÜ¢£¥₧́áíóúñÑªº¿Ò¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp863': "ÇüéâÂà¶çêëèïî═À§ÉœŒôëòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼§«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp865': "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ",
    
    'cp866': "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■ ",
    
    'cp1250': "€ ‚„…†‡  ‰Š‹ŚŤŽŹ  ‘’“”•–—  ™š›śťžź ˇ˘Ł¤Ą¦§¨©Ş«¬®Ż°±˛ł´µ¶·¸ąºş»Ľ˝ľż",
    
    'cp1251': "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя",
    
    'cp1252': "€ ‚ƒ„…†‡ˆ‰Š‹Œ Ž  ‘’“”•–—˜™š›œ žŸ ¡¢£¤¥¦§¨©ª«¬\xad®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    
    // ISO-8859-1 utiliza directamente el mapeo estándar de bytes 160-255 (los bytes 128-159 son de control y están vacíos)
    'iso8859-1': " ¡¢£¤¥¦§¨©ª«¬\xad®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    
    // ISO-8859-15 es similar a ISO-8859-1 con cambios menores (como el símbolo de Euro, etc.)
    'iso8859-15': " ¡¢£€¥Š§š©ª«¬\xad®¯°±²³Žµ¶·ž¹º»ŒœŸ¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",

    // Marcador de posición GB18030 (maneja puntuación común, dígitos y ASCII estándar)
    'gb18030': ""
  };

  /**
   * Traduce una cadena de texto en un arreglo de bytes (Uint8Array) para la tabla de códigos elegida.
   * Los caracteres no soportados se reemplazan por el signo de interrogación '?' (0x3F).
   * 
   * @param {string} text - Cadena de texto a codificar.
   * @param {string} [charset='cp850'] - Juego de caracteres de destino.
   * @returns {Uint8Array} El arreglo de bytes codificado.
   */
  static encode(text, charset = 'cp850') {
    const target = charset.toLowerCase();
    const result = new Uint8Array(text.length);

    // Si es GB18030/GBK y TextEncoder está disponible en el entorno, intentamos usar la codificación nativa
    if (target === 'gb18030' || target === 'gbk') {
      try {
        const encoder = new TextEncoder(target);
        return encoder.encode(text);
      } catch (e) {
        console.warn(`El codificador nativo para ${charset} no está disponible. Extrayendo en formato ASCII básico.`);
      }
    }

    const lookup = this.CODE_PAGES[target] || this.CODE_PAGES['cp850'];
    const isIso = target.startsWith('iso');
    const startByte = isIso ? 160 : 128; // Las codificaciones ISO comienzan su mapeo extendido en el byte 160

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);

      if (code < 128) {
        // ASCII Estándar
        result[i] = code;
      } else if (char === '€' && target === 'cp850') {
        // Reemplazo manual para el símbolo de Euro en CP850 (mapeado en 0xD5 en impresoras ESC/POS modificadas)
        result[i] = 0xD5;
      } else {
        const idx = lookup.indexOf(char);
        if (idx !== -1) {
          result[i] = startByte + idx;
        } else {
          // Reemplazo de respaldo a '?'
          result[i] = 0x3F;
        }
      }
    }

    return result;
  }

  /**
   * Normaliza los acentos, eñes y signos de puntuación del español
   * a sus equivalentes de 7 bits en ASCII.
   * 
   * @param {string} text - Texto de entrada a normalizar.
   * @returns {string} El texto normalizado.
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
