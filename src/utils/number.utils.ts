/**
 * Convert a `number` that can be `null` or `undefined` to a valid number. The optional `defaultValue`
 * parameter will provide the value to use if the parameter is invalid. This parameter defaults to zero.
 *
 * @param {number | undefined | null} value Number Value.
 * @param {number} defaultValue Default Number Value (Optional: default = 0).
 * @return {number} Default Value if Value is undefined or null.
 * @author Zach Ayers
 */
export const defaultNumber = (
  value: number | undefined | null,
  defaultValue = 0
): number => {
  return value ? value : defaultValue;
};

/**
 * If an `undefined` or `null` value is provided then `undefined` is returned. If a `number` is `NaN` or
 * a `string` is `NaN` when converted to a `number`, `undefined` is returned. Otherwise a valid `number` is returned.
 *
 * @param {string | number | undefined | null} value String, Number or Undefined/Null Value.
 * @return {number | undefined} Number or Undefined.
 * @author Zach Ayers
 */
export const toNumber = (
  value: string | number | undefined | null
): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "number") {
    return isNaN(value) ? undefined : value;
  }

  const numValue = Number(value);

  return isNaN(numValue) ? undefined : numValue;
};
