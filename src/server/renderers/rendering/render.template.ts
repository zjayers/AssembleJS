import type { ComponentContext } from "../../../types/component.context";
import type { AnyObject } from "../../../types/object.any";
import type { ComponentParams } from "../../../types/component.params";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { ComponentRenderer } from "../../../types/component.renderer";
import { getRenderer } from "./get.renderer";
import { mutateBlueprint } from "../../../utils/component.utils";

/**
 * Render a template to HTML.
 * @param {ComponentContext<AnyObject, ComponentParams>} context - The context to render.
 * @return {string | Promise<string> | Buffer | Promise<Buffer>}  - The rendered template.
 * @author Zach Ayers
 */
export async function renderTemplate(
  context: ComponentContext<AnyObject, ComponentParams>
): Promise<string | Buffer> {
  context.request = {} as FastifyRequest;
  context.reply = {} as FastifyReply;
  const renderer: ComponentRenderer = await getRenderer(context);
  // Render the template and clean it up
  const template = await renderer.render(context);
  return context.renderAsBlueprint
    ? mutateBlueprint(template, context)
    : template;
}
