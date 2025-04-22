import type { ComponentContext } from "./component.context";
import type { ComponentPublicData } from "./component.simple.types";
import type { ComponentParams } from "./component.params";

/**
 * The Component Factory runs on a Component template before the HTML is returned from the content route handler.
 * @category (Component)
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * const helloFactory: ComponentFactory = {
 *   priority: 1,
 *   factory: (context: ComponentContext) => {
 *     if (context.deviceType === "MOBILE") {
 *       context.addHelper((name: string) => {
 *         return name.toUpperCase()
 *       });
 *     }
 *   },
 * };
 * ```
 */
export type ComponentFactory<
  Public extends ComponentPublicData,
  Params extends ComponentParams
> = {
  /** The priority this factory should run in. Lower numbers are processed first */
  priority?: number;
  /** The processing function to run over a Component template before it is returned */
  factory: (context: ComponentContext<Public, Params>) => Promise<void> | void;
};
