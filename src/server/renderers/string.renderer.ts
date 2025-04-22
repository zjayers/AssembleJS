import type { ComponentRenderer } from "../../types/component.renderer";
import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import { Loggable } from "../abstract/loggable";

/**
 * Raw String Renderer
 * Renders string content directly without any template processing.
 * When the render type is STRING, the directory structure check is bypassed to allow direct string rendering.
 * @author Zach Ayers
 */
export class StringRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    // For string rendering, we directly return the template content
    // If no template is provided, return a fallback message
    return (context.template as string) ?? "No template found!";
  }
}
export const STRING = new StringRenderer();
