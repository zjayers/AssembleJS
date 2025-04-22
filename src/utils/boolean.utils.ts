/**
 * Convert value into a `boolean` whether it is a `string`, `number` or `boolean`. If value
 * is `undefined` or `null` then `false` is returned. If value is a `number` or a `string`
 * that can be parsed into a `number`, nonzero values are `true`. If a `string` is 'Y', 'YES',
 * 'T' or 'TRUE' (Case Insensitive) then it is considered `true`. All other values are
 * considered `false`.
 *
 * @param {string | boolean | number | undefined | null} value Value to Convert.
 * @return {boolean} Boolean Value.
 * @author: Zach Ayers
 */
export const toBoolean = (
  value: string | boolean | number | undefined | null
): boolean => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const numValue = parseInt(value, 10);

  if (!isNaN(numValue)) {
    return numValue !== 0;
  }

  switch (value.toUpperCase()) {
    case "Y":
    case "YES":
    case "T":
    case "TRUE":
      return true;
    default:
  }
  return false;
};

/**
 * Converts the value to a `boolean` via `toBoolean(value)` and then returns `true` when the
 * `boolean` value is `true`.
 *
 * @param {string | boolean | number | undefined | null} value Value to Test.
 * @return {boolean} True if Value can be converted to a True Boolean.
 * @author: Zach Ayers
 */
export const isTrue = (
  value: string | boolean | number | undefined | null
): boolean => {
  return toBoolean(value);
};

/**
 * Converts the value to a `boolean` via `toBoolean(value)` and then returns true when the
 * `boolean` value is `false` (Not True).
 *
 * @param {string | boolean | number | undefined | null} value Value to Test.
 * @return {boolean} True if Value can be converted to a False Boolean.
 * @author: Zach Ayers
 */
export const isNotTrue = (
  value: string | boolean | number | undefined | null
): boolean => {
  return !toBoolean(value);
};

/**
 * Utility Method: Intakes an array of boolean expressions and expects all to evaluate to True.
 * @param {boolean[]} booleanExpressions - Array of boolean expressions.
 * @return {boolean} True if all expressions evaluate to True, otherwise False.
 * @author Zach Ayers
 */
export const allBooleansAreTrue = (booleanExpressions: boolean[]) =>
  booleanExpressions.every((def) => def);
