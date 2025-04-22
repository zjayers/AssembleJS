import { condenseSpace, trimPunctuation } from "./string.utils";
import { PATTERN_HTML_TAG } from "./pattern.utils";

/**
 * Convert all compilable exts to their dist counterpart.
 * @param {string} html - html to convert
 * @return {string} - converted html
 * @note !!! THIS IS ONLY FOR USE DURING DEVELOPMENT !!!
 * @todo - Standardize this so we don't start compiling files and not sanitizing in development.
 * @author Zach Ayers
 */
export function convertExtsToDistPointer(html: string) {
  return html.replaceAll(".scss", ".css").replaceAll(".ts", ".js");
}

/**
 * Encodes text to be compatible inside an html element as content, or an html attribute value
 * Converts: & > < " '
 * Warning: This is NOT intended to encode javascript content(unless its stringified JSON only for inside a HTML element, not a SCRIPT element), html attributes, tag names, etc.
 *          Other security concerns exist when embedding in those contexts and that is not handled here
 * @param {unknown} text
 * @param {string} defaultValue
 * @return {string}
 * @author Zach Ayers
 */
export function encodeHtml(text: any, defaultValue: string = ""): string {
  if (text === undefined || null === text) {
    return defaultValue;
  }
  if ("string" !== typeof text) {
    text = text.toString();
  }
  let ret = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "&":
        ret += "&amp;";
        break;
      case "<":
        ret += "&lt;";
        break;
      case ">":
        ret += "&gt;";
        break;
      case '"':
        ret += "&#34;";
        break;
      case "'":
        ret += "&#39;";
        break;
      default:
        ret += c;
        break;
    }
  }
  return ret;
}

/**
 * Compare HTML test 'a' and HTML text 'b' and return if they match.
 * @param {string} text1 - HTML text
 * @param {string} text2 - HTML text to compare against
 * @return {boolean} - true if they match
 * @author Zach Ayers
 */
export function comparePossibleHTML(text1: string, text2: string): boolean {
  text1 = condenseSpace(htmlTagRemover(text1).toUpperCase().trim());

  text2 = condenseSpace(htmlTagRemover(text2).toUpperCase().trim());

  return text1 === text2;
}

/**
 * Remove Tags from HTML text.
 * @param {string} text - HTML text
 * @return {string} - HTML text without tags
 * @author Zach Ayers
 */
export function htmlTagRemover(text: string): string {
  text = trimPunctuation(text);

  const regexResult: RegExpMatchArray | null = text.match(PATTERN_HTML_TAG);
  if (regexResult && regexResult?.length > 0) {
    regexResult.forEach((result: string) => {
      text = text.replace(result, "");
    });
  }

  return text;
}
