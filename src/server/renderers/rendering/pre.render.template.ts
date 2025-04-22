import type { BlueprintServerOptions } from "../../../types/blueprint.server.options";
import type { Component } from "../../../types/component";
import type { ComponentView } from "../../../types/component.view";
import type { ComponentRenderer } from "../../../types/component.renderer";
import type { AnyObject } from "../../../types/object.any";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AxiosInstance } from "axios";
import type { ComponentDevice } from "../../../types/component.device";
import { getRenderer } from "./get.renderer";
import { ComponentContext } from "../../../types/component.context";
import { randomUUID } from "crypto";

/**
 * Prerender the template on the server, this allows us to examine the contents and adjust accordingly.
 * @param {BlueprintServerOptions} userOpts - The user options.
 * @param {Component} component - The component to render.
 * @param {ComponentView} view - The view to render.
 * @return {string | Promise<string> | Buffer | Promise<Buffer>} - The rendered template.
 * @author Zach Ayers
 */
export async function preRenderTemplate(
  userOpts: BlueprintServerOptions,
  component: Component,
  view: ComponentView
): Promise<string> {
  // Setup renderer var
  const renderer: ComponentRenderer = await getRenderer(view);
  const mockedComponents: Record<string, string> = {};
  const pushToComponentArr = (arr: ComponentView["components"]) => {
    arr?.forEach((child) => {
      mockedComponents[child.name] = `<div>${child.name}</div>`;
    });
  };

  pushToComponentArr(userOpts.manifest.shared?.components);
  pushToComponentArr(component.shared?.components);
  pushToComponentArr(view.components);

  // Mock a ComponentContext, pass in the template, and render
  const renderResult = await renderer.render(
    new ComponentContext({
      ...(view.template !== undefined &&
        view.getTemplate !== undefined && { template: view.template }),
      ...(view.templateFile !== undefined &&
        view.getTemplate && {
          template: view.getTemplate() as string,
          templateFile: view.templateFile,
        }),
      nestLevel: 0,
      serverUrl: "http://localhost:3000",
      id: randomUUID(),
      renderAsBlueprint: false,
      components: mockedComponents as AnyObject,
      componentName: component.path,
      viewName: view.viewName,
      data: {} as Record<string, unknown>,
      request: {} as FastifyRequest,
      reply: {} as FastifyReply,
      api: {} as AxiosInstance,
      helpers: {}, // Required by INodeContext
      deviceType: "DESKTOP" as ComponentDevice,
      title: view.viewName || "AssembleJS View",
      params: {
        headers: {} as AnyObject,
        path: {} as AnyObject,
        query: {} as AnyObject,
        body: {} as AnyObject,
      },
    })
  );
  
  return renderResult.toString();
}
