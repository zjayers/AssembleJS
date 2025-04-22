/**
 * Convert a value that could be `null` or `undefined` to a valid `string`. In addition, an value of an unknown type that is NOT `undefined`, `null` or a `string` will be converted to a `string`.
 *
 * @param {unknown | string | undefined | null} value String Value.
 * @param {string} defaultValue Default String Value. (Optional: default = '')
 * @returns {string} Returns Default String Value if Value is Undefined/Null.
 */
import { PATTERN_MULTIPLE_SPACES, PATTERN_PUNCTUATION } from "./pattern.utils";

/**
 * Check if the length of the provided string matches the provided number.
 * @param {string} str - The String to be checked.
 * @param {number} length - The expected length of the String.
 * @return {boolean} True if <code>string.length</code> equals the expected number value.
 * @author Zach Ayers
 */
export const isStringOfLength = (str: string, length: number) =>
  str.length === length;

/**
 * Return a default string if the passed in string is null.
 * @param {unknown} value - The value to be checked.
 * @param {string} defaultValue - The default value to return if the value is null.
 * @return {string} - The default value if the value is null.
 * @author Zach Ayers
 */
export const defaultString = (
  value: unknown | string | undefined | null,
  defaultValue = ""
): string => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return typeof value === "string" ? value : String(value);
};

/**
 * Return a string if it is not empty. Otherwise, return undefined.
 *
 * @param {string | undefined | null} value String or Undefined value.
 * @return {string | undefined} String or Undefined if Empty.
 * @author Zach Ayers
 */
export const optionalString = (
  value: string | undefined | null
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return isNotEmpty(value) ? value : undefined;
};

/**
 * Return a string if it is not blank. Otherwise, return undefined.
 *
 * @param {string | undefined | null} value String or Undefined value.
 * @return {string | undefined} String or Undefined if blank.
 * @author Zach Ayers
 */
export const optionalBlankString = (
  value: string | undefined | null
): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return isNotBlank(value) ? value : undefined;
};

/**
 * Convert a value that could be null or undefined to a valid all lowercase string.
 *
 * @param {unknown | string | undefined | null} value String Value.
 * @return {string} Returns Empty String Value if Value is Undefined/Null or lowercase string.
 * @author Zach Ayers
 */
export const toLowerCase = (
  value: unknown | string | undefined | null
): string => {
  return defaultString(value).toLowerCase();
};

/**
 * Convert a value that could be null or undefined to a valid all uppercase string.
 *
 * @param {unknown | string | undefined | null} value String Value.
 * @return {string} Returns Empty String Value if Value is Undefined/Null or uppercase string.
 * @author Zach Ayers
 */
export const toUpperCase = (
  value: unknown | string | undefined | null
): string => {
  return defaultString(value).toUpperCase();
};

/**
 * Get the first non-empty string value or return an empty string.
 *
 * @param {Array<string | undefined | null>} values Values to Coalesce.
 * @return {string} First Non-Empty String value or Empty String.
 * @author Zach Ayers
 */
export const coalesceIsEmpty = (
  ...values: Array<string | undefined | null>
): string => {
  let returnValue: string | undefined;

  values.every((value) => {
    if (!isEmpty(value)) {
      returnValue = <string>value;
      return false;
    }

    return true;
  });

  return defaultString(returnValue);
};

/**
 * Get the first non-blank string value or return an empty string.
 *
 * @param {Array<string | undefined | null>} values Values to Coalesce.
 * @return {string} First Non-Blank String value or Empty String.
 * @author Zach Ayers
 */
export const coalesceIsBlank = (
  ...values: Array<string | undefined | null>
): string => {
  let returnValue: string | undefined;

  values.every((value) => {
    if (!isBlank(value)) {
      returnValue = <string>value;
      return false;
    }

    return true;
  });

  return defaultString(returnValue);
};

/**
 * Determine if the provided string variable is empty.
 *
 * @param {Array<unknown> | string | undefined | null} value String Value.
 * @return {boolean} True if String is Empty.
 * @author Zach Ayers
 */
export const isEmpty = (
  value: Array<unknown> | string | undefined | null
): boolean => {
  if (Array.isArray(value)) {
    return value.length < 1;
  }
  return value === undefined || value === null || String(value).length < 1;
};

/**
 * Determine if the provided string variable is NOT empty.
 *
 * @param {Array<unknown> | string | undefined | null} value String Value.
 * @return {boolean} True if String is NOT Empty.
 * @author Zach Ayers
 */
export const isNotEmpty = (
  value: Array<unknown> | string | undefined | null
): boolean => {
  return !isEmpty(value);
};

/**
 * Determine if the provided string variable is blank.
 *
 * @param {Array<unknown> | string | undefined | null} value String Value.
 * @return {boolean} True if String is Blank.
 * @author Zach Ayers
 */
export const isBlank = (
  value: Array<unknown> | string | undefined | null
): boolean => {
  if (Array.isArray(value)) {
    return value.length < 1;
  }
  return (
    value === undefined || value === null || String(value).trim().length < 1
  );
};

/**
 * Determine if the provided string variable is NOT blank.
 *
 * @param {Array<unknown> | string | undefined | null} value String Value.
 * @return {boolean} True if String is NOT Blank.
 * @author Zach Ayers
 */
export const isNotBlank = (
  value: Array<unknown> | string | undefined | null
): boolean => {
  return !isBlank(value);
};

/**
 * Take the provided string and remove trailing punctuation.
 *
 * @param {string | undefined | null} value Value to Trim.
 * @return {string} Trimmed Value.
 * @author Zach Ayers
 */
export const trimPunctuation = (value: string | undefined | null): string => {
  return defaultString(value).replace(PATTERN_PUNCTUATION, "");
};

/**
 * Convert Set/Array to delimited String.
 *
 * @param {Set<any> | Array<any>} collection Set or Array.
 * @param {string} delimiter Delimiter string. (Optional: default = ',')
 * @return {string} Delimited String.
 * @author Zach Ayers
 */
export const toDelimitedString = (
  collection: Set<any> | Array<any>,
  delimiter = ","
): string => {
  if (Array.isArray(collection)) {
    return collection.join(delimiter);
  }

  return [...collection].join(delimiter);
};

/**
 * Replace all non-supported characters in a string.
 * @description This is ported from `strUtils.cfc#replaceExtendedChararacters`
 * @param {string} value - String value
 * @return {string} String value with all non-supported (unicode) characters replaced.
 * @author Zach Ayers
 * @author Zach Ayers
 */
export const replaceExtendedCharacters = (value: string): string => {
  const availableReplacements: {
    values: Array<RegExp>;
    replacement: string;
  }[] = [
    {
      replacement: "'",
      values: [/[\x91-\x92]/g, new RegExp("’", "g")],
    },
    {
      replacement: '"',
      values: [
        /[\x93-\x94]/g,
        new RegExp(String.fromCharCode(8220), "g"),
        new RegExp(String.fromCharCode(8221), "g"),
      ],
    },
    { replacement: "-", values: [/[\x96-\x97]/g] },
    {
      replacement: "a",
      values: [/[\x9c\xe0-\xe6]/g],
    },
    { replacement: "z", values: [/\x9e/g] },
    {
      replacement: "Y",
      values: [/[\x9f\xdd]/g],
    },
    { replacement: "i", values: [/\xa1/g, /[\xec-\xef]/g] },
    {
      replacement: "A",
      values: [/[\xc0-\xc6]/g],
    },
    { replacement: "C", values: [/\xc7/g] },
    {
      replacement: "E",
      values: [/[\xc8-\xcb]/g],
    },
    { replacement: "I", values: [/[\xcc-\xcf]/g] },
    {
      replacement: "D",
      values: [/\xd0/g],
    },
    { replacement: "N", values: [/\xd1/g] },
    {
      replacement: "O",
      values: [/[\xd2-\xd6]/g],
    },
    { replacement: "0", values: [/[\xd8\xf8]/g] },
    {
      replacement: "U",
      values: [/[\xd9-\xdc]/g],
    },
    { replacement: "P", values: [/\xde/g] },
    {
      replacement: "B",
      values: [/\xdf/g],
    },
    { replacement: "c", values: [/\xe7/g] },
    {
      replacement: "e",
      values: [/\xe8-\xeb]/g],
    },
    {
      replacement: "o",
      values: [/[\xf0\xf2-\xf6]/g],
    },
    { replacement: "u", values: [/[\xf9-\xfc]/g] },
    {
      replacement: "y",
      values: [/[\xfd\xff]/g],
    },
    { replacement: "p", values: [/\xfe/g] },
    {
      replacement: "*",
      values: [new RegExp(String.fromCharCode(8226), "g")],
    },
    {
      replacement: " ",
      values: [
        /[^\x00-\x7F]/g,
        /\x03/g,
        ...[
          1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22,
          23, 25,
        ].map((i) => new RegExp(String.fromCharCode(i), "g")),
      ],
    },
    {
      replacement: "",
      values: [
        /\x00/g,
        /\x01/g,
        /\x02/g,
        /\x03/g,
        /\x04/g,
        /\x05/g,
        /\x06/g,
        /\x07/g,
        /\x08/g,
        /\x11/g,
        /\x12/g,
        /\x14/g,
        /\x15/g,
        /\x16/g,
        /\x17/g,
        /\x18/g,
      ],
    },
  ];

  // Perform all nested replacements on the string
  availableReplacements.forEach((matcher) => {
    matcher.values.forEach((pattern) => {
      value = value.replace(pattern, matcher.replacement);
    });
  });

  return value;
};

/**
 * Condense all mutli-space sections to single spaces.
 * @param {string} text - Text to condense.
 * @return {string} - Condensed text.
 * @author Zach Ayers
 */
export const condenseSpace = (text: string): string => {
  const regexResult: RegExpMatchArray | null = text.match(
    PATTERN_MULTIPLE_SPACES
  );

  if (regexResult && regexResult?.length > 0) {
    regexResult.forEach((result: string) => {
      text = text.replace(result, " ");
    });
  }

  return text;
};
