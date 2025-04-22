/**
 * Address where a Component may request content from another component
 * @public
 * @category (Component)
 * @author Zach Ayers
 * @example
 * ```typescript
 * const address: ComponentAddress = {
 *     name: 'calculator',
 *     contentUrl: "https://my-components.com/v1/common-components/calculator",
 *     manifestUrl:
 *       "https://my-components.com/v1/common-components/calculator/manifest.json",
 *     renderTimeout: 3000,
 *     requestRetries: 2,
 *     requestTimeout: 4000,
 *   }
 * ```
 */
export interface ComponentAddress {
  /** Name of the child Component - This doubles as the templating variable */
  readonly name: string;
  /** HTTP(S) address of the URL where the child Component's content is served */
  readonly contentUrl: string;
  /** HTTP(S) address of the URL where the child Component's manifest is served */
  readonly manifestUrl?: string;
  /** Timeout (in milliseconds) for the content and manifest HTTP(S) requests.
   * Once a request timeout is reached, any defined fallbacks will be used in order.
   * */
  readonly requestTimeout?: number;
}
