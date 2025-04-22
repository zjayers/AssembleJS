import { defaultString } from "./string.utils";
import {
  PATTERN_ALL_ZEROS,
  PATTERN_CURRENCY,
  PATTERN_DATE,
  PATTERN_DATE_SEPARATOR,
  PATTERN_HEX_DIGITS,
} from "./pattern.utils";

/**
 * Verify that a `string` contains a valid date. This will ensure that the date is formatted
 * using either 'MM.DD.YYYY', 'MM-DD-YYYY' or 'MM/DD/YYYY' formats. It also ensures that none of
 * the date components are all zeros and that the month and day components are within their
 * respective valid ranges.
 *
 * @param {string} date Date as a String.
 * @return {boolean} True if Valid Date.
 * @author Zach Ayers
 */
export const verifyDate = (date: string): boolean => {
  const regexResult = date.match(PATTERN_DATE);

  if (regexResult === null || regexResult.length === 0) {
    return false;
  }

  const dateSeparator: string[] | null = PATTERN_DATE_SEPARATOR.exec(date);
  const dateParts: string[] = date.split(dateSeparator ? dateSeparator[1] : "");
  let response = true;

  dateParts.every((part) => {
    if (PATTERN_ALL_ZEROS.test(part)) {
      response = false;
    }
    return response;
  });

  // Check Months and Days to be in valid Ranges.
  if (response) {
    const month = parseInt(dateParts[0], 10);
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    if (month < 0 || month > 12) {
      response = false;
    } else {
      const maxDays = new Date(year, month, 0).getDate();

      if (day < 0 || day > maxDays) {
        response = false;
      }
    }
  }

  return response;
};

/**
 * Test the length of a `string` based on the provided `min` and `max` length values.
 *
 * @param {string} text String Value.
 * @param {number | undefined} minLen Minimum String Length or Undefined.
 * @param {number | undefined} maxLen Maximum String Length or Undefined.
 * @return {boolean} True if Valid String.
 * @author Zach Ayers
 */
export const verifyText = (
  text: string,
  minLen?: number,
  maxLen?: number
): boolean => {
  return !(
    (minLen !== undefined && text.length < minLen) ||
    (maxLen !== undefined && text.length > maxLen)
  );
};

/**
 * Test the `string` or `boolean` to determine if it is a proper `boolean` value.
 *
 * @param {string | boolean} value String or Boolean Value.
 * @return {boolean} True if the value is a boolean.
 * @author Zach Ayers
 */
export const verifyBoolean = (value: string | boolean): boolean => {
  if (typeof value === "boolean") {
    return true;
  }

  const textValue = defaultString(value).toLowerCase();

  return textValue === "true" || textValue === "false";
};

/**
 * Test the `string` or number to determine if it is a binary value.
 *
 * @param {string | number} value String or Number value.
 * @return {boolean} True if the value is binary.
 * @author Zach Ayers
 */
export const verifyBinary = (value: string | number): boolean => {
  if (typeof value === "number") {
    return value === 0 || value === 1;
  }

  return value === "0" || value === "1";
};

/**
 * Test the `string` to determine if it is a hexidecimal value.
 *
 * @param {string} value
 * @return {boolean} True if the value is hexidecimal
 * @author Zach Ayers
 */
export const verifyHexidecimal = (value: string): boolean => {
  const regexResult = value.match(PATTERN_HEX_DIGITS);

  if (regexResult === null || regexResult.length === 0) {
    return false;
  }

  return true;
};

/**
 * Test the `string` or `number` to determine if it is a valid currency value.
 *
 * @param {string} value String Value
 * @return {boolean} True if the String is a valid currency value.
 * @author Zach Ayers
 */
export const verifyCurrency = (value: string): boolean => {
  const regexResult = value.match(PATTERN_CURRENCY);

  // The function should return true for valid currency values
  return !(regexResult === null || regexResult.length === 0);
};
