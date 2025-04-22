/**
 * Encodes a JSON object so it can be embedded into a SCRIPT tag as JSON content
 * Converts: < to \u003c
 *
 * WARNING: This is only for <SCRIPT type="text/json"> tags
 * @param {object} json Json Content
 * @return {string}
 * @author Zach Ayers
 */
export function encodeJson(json: object): string {
  const text = JSON.stringify(json);
  let ret = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    switch (c) {
      case "<":
        ret += "\\u003c";
        break;
      default:
        ret += c;
        break;
    }
  }
  return ret;
}
