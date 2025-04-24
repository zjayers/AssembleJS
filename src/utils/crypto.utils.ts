import * as crypto from "crypto";

/**
 * Hashes the supplied string using MD5 and UTF8 encoding.
 * Matches the default CF hash function Hash(tText) / Hash(tText, "MD5", "UTF-8")
 * @param {string} stringToHash - String to hash
 * @return {string} Hex hash string
 * @author Zachariah Ayers
 * @category Utils
 * @public
 */
export const hash = (stringToHash: string): string => {
  const hashValue = crypto
    .createHash("md5", { encoding: "utf8" })
    .update(stringToHash)
    .digest("hex");
  return hashValue.toUpperCase();
};
