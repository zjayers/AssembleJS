import type { ComponentView } from "./component.view";

/**
 * Content Factory
 * @description Function
 * to run over a fetched content before it is parsed for Server Side Composition
 * @category (Manifest)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * // Parse the old content and create the new content
 * const processContent: ContentFactory = {
 *   priority: 1,
 *   factory: (content: string) => {
 *     return content.replace('TEMPLATE_TOKEN', 'Hello World!');
 *   },
 * };
 * ```
 */
export interface ContentFactory {
  /** The priority this factory should run in. Lower numbers are processed first */
  priority?: number;
  /** The processing function to run over a Content before it is available for template injection */
  factory: (content: string) => ComponentView["template"];
}
