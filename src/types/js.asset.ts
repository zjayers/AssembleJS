/**
 * Programmatic representation of a JS script tag.
 * @description Assets built using this interface may be passed to the AssembleJS Script Builder
 * to create a consumable script tag.
 * @category (Face) [JS]
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * // Create a new JS Asset
 * const jsAsset: AssetJS = {
 *   src:
 *     "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js",
 *   crossorigin: 'anonymous',
 *   defer: true,
 * }
 * ```
 */
export interface JsAsset {
  /** The priority in which to place this asset in the document - Lower numbers are processed first */
  readonly priority?: number;
  /** Place a script in the head element, or after the body element in the document */
  readonly placement?: "head" | "after-body";
  /** Specifies the URL of an external script file */
  readonly src: string;
  /** Specifies which referrer information to send when fetching a script */
  readonly referrerpolicy?: /** No referrer information is sent */
  | "no-referrer"
    /** Default. Sends the origin, path, and query string if the protocol security level stays the same or is higher (HTTP to HTTP, HTTPS to HTTPS, HTTP to HTTPS is ok). Sends nothing to less secure level (HTTPS to HTTP is not ok) */
    | "no-referrer-when-downgrade"
    /** Sends the origin (scheme, host, and port) of the document */
    | "origin"
    /** Sends the origin of the document for cross-origin request. Sends the origin, path, and query string for same-origin request */
    | "origin-when-cross-origin"
    /** Sends a referrer for same-origin request. Sends no referrer for cross-origin request */
    | "same-origin"
    /** Sends the origin if the protocol security level stays the same or is higher (HTTP to HTTP, HTTPS to HTTPS, and HTTP to HTTPS is ok). Sends nothing to less secure level (HTTPS to HTTP) */
    | "strict-origin-when-cross-origin"
    /** Sends the origin, path, and query string (regardless of security). Use this value carefully!; */
    | "unsafe-url";
  /** Sets the mode of the request to an HTTP CORS Request */
  readonly crossorigin?: "anonymous" | "use-credentials";
  /** Allows a browser to check the fetched script to ensure that the code is never loaded if the source has been manipulated */
  readonly integrity?: string;
  /** Specifies that the script should not be executed in browsers supporting ES2015 modules */
  readonly nomodule?: boolean;
  /** Specifies that the script is downloaded in parallel to parsing the page, and executed as soon as it is available (before parsing completes) (only for external scripts) */
  readonly async?: boolean;
  /** Specifies that the script is downloaded in parallel to parsing the page, and executed after the page has finished parsing (only for external scripts) */
  readonly defer?: boolean;
  /** The MIME type of the linked document.
   Look at {@link http://www.iana.org/assignments/media-types/media-types.xhtml}
   for a complete list of standard MIME types */
  readonly type?: string;
}
