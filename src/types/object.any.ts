/**
 * Utility type to represent a Record<string, any>.
 * @description This allows string typing of all anonymous objects.
 * @category (Utility)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * const obj: AnyObject = { foo: 'bar', baz: 123, arr: [1, 2, 3, 4]}
 * ```
 */
export type AnyObject = Record<string, any>;
