import type { ComponentContext, ViewContext } from "../types/component.context";
import type { ComponentPublicData } from "../types/component.simple.types";
import type { ComponentParams } from "../types/component.params";

/**
 * Create a Sanitized context object that can be sent to the browser. This is the data that will be available and loaded into the client.
 * @param {ComponentContext<AnyObject, AnyObject, ComponentParams>} context - The context object to sanitize.
 * @return {ViewContext} - The sanitized context object.
 * @author Zach Ayers
 */
export function getSafeContext(
  context: ComponentContext<ComponentPublicData, ComponentParams>
): Required<ViewContext> {
  return {
    viewName: context.viewName,
    componentName: context.componentName,
    id: context.id,
    params: context.params,
    data: context.data,
    renderAsBlueprint: context.renderAsBlueprint,
    deviceType: context.deviceType,
    components: context.components,
    nestLevel: context.nestLevel,
    title: context.title,
    serverUrl: context.serverUrl,
    renderer: context.renderer || "HTML",
  };
}
