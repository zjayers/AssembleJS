import type { AnyObject } from "./object.any";
import type { TSchema } from "@sinclair/typebox";

/**
 * Possible context parameters that may be passed to a ComponentTemplate
 * @category (Component)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * const params: ComponentParams = {
 *   query: {
 *     userId: 1,
 *     name: "Darth Vader",
 *     goal: "Rule the Galaxy"
 *   },
 * }
 * ```
 */
export interface ComponentParams {
  /** Header parameters expected on the current context object */
  headers: AnyObject;
  /** Path parameters expected on the current context object */
  path: AnyObject;
  /** Query parameters expected on the current context object */
  query: AnyObject;
  /** Body parameters expected on the current context object */
  body: AnyObject;
}

/**
 * Possible request parameters that may be passed to a Component
 * @category (Component)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * const paramsSchema: ComponentParamsSchema = {
 *   query: {
 *     title: "Longitude and Latitude Values",
 *     description: "A geographical coordinate.",
 *     required: [ "latitude", "longitude" ],
 *     type: "object",
 *     properties: {
 *       latitude: {
 *         type: "number",
 *         minimum: -90,
 *         maximum: 90
 *       },
 *       longitude: {
 *         type: "number",
 *         minimum: -180,
 *         maximum: 180
 *       }
 *     }
 *   },
 * }
 * ```
 */
export interface ComponentParamsSchema {
  /** Header parameters expected on the current request object */
  headers: TSchema | AnyObject;
  /** Path parameters expected on the current request object */
  path: TSchema | AnyObject;
  /** Query parameters expected on the current request object */
  query: TSchema | AnyObject;
  /** Body parameters expected on the current request object */
  body: TSchema | AnyObject;
}
