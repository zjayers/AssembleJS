import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ComponentFactory } from "../../types/component.factory";
import type {
  BlueprintDevServer,
  BlueprintServerOptions,
} from "../../types/blueprint.server.options";
import type { AnyObject } from "../../types/object.any";
import type { Assembly } from "../../types/blueprint.simple.types";
import type { RawTemplate } from "../../types/component.simple.types";
import type { ComponentView } from "../../types/component.view";
import type { ComponentParams } from "../../types/component.params";
import type { ComponentDevice } from "../../types/component.device";
import type { Component } from "../../types/component";
import { ComponentContext } from "../../types/component.context";
import { BlueprintController } from "./blueprint.controller";
import { HttpError } from "../../utils/http.utils";
import { ASSEMBLEJS } from "../config/blueprint.config";
import axios from "axios";
import parser from "ua-parser-js";
import { randomUUID } from "crypto";
import { isValidHttpUrl } from "../../utils/http.utils";
import { combine } from "../../utils/object.utils";
import { renderTemplate } from "../renderers/rendering/render.template";
type BaseFactoryArray = Array<
  ComponentFactory<{}, { headers: {}; path: {}; query: {}; body: {} }>
>;

/**
 * Base Controller Implementation for serving an AssembleJS Component.
 * @author Zach Ayers
 */
export abstract class ComponentController extends BlueprintController {
  /**
   * Register the controller.
   * @param {Assembly} app - The AssembleJS instance.
   * @param {BlueprintServerOptions} userOpts - The user-defined options.
   * @param {Component} component - The component to serve.
   * @param {ComponentView} view - The view to serve.
   * @param devServer - The development server.
   * @returns {Promise<void>} - The promise to wait for.
   * @author Zach Ayers
   */
  abstract override register(
    app: Assembly,
    userOpts?: BlueprintServerOptions,
    component?: Component,
    view?: ComponentView,
    devServer?: BlueprintDevServer
  ): void;

  /**
   * Run any AssembleJS factories.
   * @param {ComponentContext<AnyObject, ComponentParams>} context - The context to run the factories on.
   * @param {{global: BaseFactoryArray, component: BaseFactoryArray, view: BaseFactoryArray}} procs - The factories to run.
   * @private
   * @author Zach Ayers
   */
  protected async runFactories(
    context: ComponentContext<AnyObject, ComponentParams>,
    procs: {
      global: BaseFactoryArray;
      component: BaseFactoryArray;
      view: BaseFactoryArray;
    }
  ) {
    // First - run view factories
    for (const proc of procs.view) {
      await proc.factory(context);
    }
    // Next - run component level factories
    for (const proc of procs.component) {
      await proc.factory(context);
    }
    // Finally - run global level factories
    for (const proc of procs.global) {
      await proc.factory(context);
    }
  }

  /**
   * When running in development mode, inject any items provided by the user in the 'developmentOptions' section.
   * Also injects the AssembleJS development panel when in development mode.
   * @param {ComponentContext} context - The context to inject into.
   * @param {Component} component - The component to inject into.
   * @param {ComponentView} view - The view to inject into.
   * @return {string} - The rendered template.
   * @private
   * @author Zach Ayers
   */
  protected async injectDevelopmentItems(
    context: ComponentContext<AnyObject, ComponentParams>,
    component: Component,
    view: ComponentView
  ) {
    // If not local, do nothing to template
    if (!ASSEMBLEJS.isLocal() || view.getTemplate === undefined) {
      return context.template;
    }

    // Note: For Preact components, templateFile is undefined but template contains the component function
    // So we removed the templateFile check

    // Create a copy of the template
    let rawTemplate = view.getTemplate() as string;

    // if a view specific contentWrapper exists, apply it
    if (view.developmentOptions?.contentWrapper) {
      rawTemplate = view.developmentOptions.contentWrapper(rawTemplate);
    }

    // If a top level component contentWrapper exists, apply it
    if (component.developmentOptions?.contentWrapper) {
      rawTemplate = component.developmentOptions.contentWrapper(rawTemplate);
    }

    // For Preact components, the panel will need to be injected differently
    // after the component has been rendered to HTML
    if (typeof rawTemplate === "function") {
      // Store a flag on the context that we'll check in the content controller
      (context as any).__injectDevPanel = context.renderAsBlueprint;

      // We can't modify the template directly here, we'll need to do it after rendering
      return rawTemplate;
    }

    // Only inject dev panel if this is a blueprint (not a nested component)
    // and if the template contains a closing body tag (meaning it's a full HTML document)
    if (
      context.renderAsBlueprint &&
      typeof rawTemplate === "string" &&
      rawTemplate.includes("</body>")
    ) {
      // Import the dev panel dynamically to avoid circular dependencies
      // and to ensure we only load it when needed
      try {
        const panelModulePath = "../../developer/panel/index.js";

        try {
          // Wait for the module to be imported
          const panelModule = await import(panelModulePath);

          if (panelModule && typeof panelModule.injectDevPanel === "function") {
            rawTemplate = panelModule.injectDevPanel(
              rawTemplate,
              context.id,
              component.path,
              view.viewName
            );
          }
        } catch (err) {
          this.log.error(
            `Failed to import development panel module: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      } catch (error) {
        this.log.error(
          `Failed to inject development panel: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // Return the raw template
    return rawTemplate;
  }

  /**
   * Fetch all child components of a view.
   * @param {Assembly} app - The AssembleJS instance.
   * @param {BlueprintServerOptions} userOpts - The user-defined options.
   * @param {Component} component - The component to serve.
   * @param {ComponentView} view - The view to serve.
   * @param {any} params - The params to pass to the view.
   * @return {Promise<any>} - The promise to wait for.
   * @private
   * @author Zach Ayers
   */
  protected async fetchViewComponents(
    app: Assembly,
    userOpts: BlueprintServerOptions,
    component: Component,
    view: ComponentView,
    params: { headers: AnyObject; query: AnyObject }
  ): Promise<Record<string, Buffer>> {
    const childContentAsyncs: Promise<Record<string, Buffer>>[] = [];

    /**
     * Function used for pushing child fetches to the asyncs array
     * @param { any[] } arr
     */
    const pushToAsyncArr = (arr: ComponentView["components"]) => {
      (arr ?? []).forEach((child) => {
        // Skip any child without a contentUrl (likely a nested component definition)
        if (!child.contentUrl) {
          this.log.warn(
            `Skipping component without contentUrl: ${child.name || "unnamed"}`
          );
          return;
        }

        // Check if the requested component is the same to prevent infinite loops
        if (child.contentUrl.includes(`/${component.path}/${view.viewName}`)) {
          this.log.warn(
            `Preventing infinite loop: Component "${component.path}/${view.viewName}" trying to load itself`
          );
          return;
        }

        childContentAsyncs.push(
          new Promise(async (resolve, reject) => {
            try {
              const fetchStart = Date.now();
              let result;

              if (isValidHttpUrl(child.contentUrl)) {
                // Axios - External Fetch with error handling
                result = await axios
                  .get(child.contentUrl, {
                    timeout: child.requestTimeout || 30000, // Default 30s timeout
                    headers: params.headers,
                    params: params.query,
                  })
                  .then((response) => response.data);
              } else {
                // Fastify - Internal Fetch
                const response = await app
                  .inject()
                  .headers(params.headers)
                  .query(params.query)
                  .get(child.contentUrl);

                // Check for error status codes
                if (response.statusCode >= 400) {
                  throw new HttpError(
                    `Error fetching component: ${response.statusCode}`,
                    response.statusCode,
                    { url: child.contentUrl, body: response.body }
                  );
                }

                result = response.rawPayload;
              }

              const fetchTime = Date.now() - fetchStart;
              if (fetchTime > 1000) {
                this.log.warn(
                  `Slow component fetch: "${child.name}" took ${fetchTime}ms`
                );
              }

              resolve({
                [child.name]: Buffer.from(result),
              });
            } catch (error) {
              // Log the error but don't fail the entire render
              this.log.error(
                `Failed to fetch component "${child.name}" at "${
                  child.contentUrl
                }": ${error instanceof Error ? error.message : "Unknown error"}`
              );

              // Resolve with an error template instead of rejecting
              resolve({
                [child.name]: Buffer.from(`
                  <div style="border: 1px solid #f44336; border-radius: 4px; padding: 12px; margin: 8px 0; font-family: sans-serif;">
                    <p style="color: #f44336; margin: 0; font-weight: bold;">Failed to load component "${
                      child.name
                    }"</p>
                    ${
                      process.env.NODE_ENV === "development"
                        ? `<p style="margin: 8px 0 0 0; font-size: 12px;">${
                            error instanceof Error
                              ? error.message
                              : "Unknown error"
                          }</p>`
                        : ""
                    }
                  </div>
                `),
              });
            }
          })
        );
      });
    };

    // Push components to awaitable Array
    pushToAsyncArr(userOpts.manifest.shared?.components);
    pushToAsyncArr(component.shared?.components);
    pushToAsyncArr(view.components);

    const childResults = await Promise.all(childContentAsyncs);
    return combine(childResults);
  }

  /**
   * Build the "CONTEXT" of a view during the content building phase.
   * @param {ComponentView} view - The view to build the context for.
   * @param {FastifyInstance} app - The fastify instance.
   * @param {BlueprintServerOptions} userOpts - The user-defined options.
   * @param {Component} component - The component to serve.
   * @param {FastifyRequest} request - The request to build the context for.
   * @param {FastifyReply} reply - The reply to build the context for.
   * @param {boolean} DATA_ONLY - Whether to only build the context for the data.
   * @return {Promise<ComponentContext<AnyObject, ComponentParams>>} - The promise to wait for.
   * @todo refactor ugly optional object syntax to use the 'coalesce' method from object utils.
   * @protected
   * @author Zach Ayers
   */
  protected async buildComponentContext(
    view: ComponentView,
    app: FastifyInstance,
    userOpts: BlueprintServerOptions,
    component: Component,
    request: FastifyRequest,
    reply: FastifyReply,
    DATA_ONLY = false
  ): Promise<ComponentContext<AnyObject, ComponentParams>> {
    const blueprintIdHeader = ASSEMBLEJS.blueprintIdHeader;
    const componentIdHeader = ASSEMBLEJS.componentIdHeader;
    const nestLevelHeader = ASSEMBLEJS.nestLevelHeader;
    const uaInfo = parser(request.headers["user-agent"]);
    const device = uaInfo.device.type ?? "desktop";
    const blueprintId = request.headers[blueprintIdHeader] as
      | string
      | undefined;
    const componentId = request.headers[componentIdHeader] as
      | string
      | undefined;
    const resolvedBlueprintId = blueprintId ?? randomUUID();
    const nestLevel =
      (request.headers[nestLevelHeader] as string | undefined) ?? 0;
    const renderAsBlueprint =
      blueprintId === undefined ||
      blueprintId.length === 0 ||
      (ASSEMBLEJS.isLocal() && nestLevel === 0);

    if (isNaN(+nestLevel)) {
      throw new Error(
        `${component.path}|${view.viewName}: '${nestLevelHeader}' header is not a number. Can not calculate nest level. Found value: ${nestLevel}`
      );
    }

    return new ComponentContext({
      renderAsBlueprint,
      ...(view.template !== undefined &&
        view.getTemplate !== undefined && {
          template: view.getTemplate() as RawTemplate,
        }),
      ...(view.templateFile !== undefined && {
        templateFile: view.templateFile,
      }),
      title: view.title ?? `${component.path} | ${view.viewName}`,
      serverUrl: request.protocol + "://" + request.hostname + request.url,
      nestLevel: Number(nestLevel),
      id: componentId !== undefined ? componentId : resolvedBlueprintId,
      components: DATA_ONLY
        ? {}
        : await this.fetchViewComponents(
            app as Assembly,
            userOpts,
            component,
            view,
            {
              headers: {
                [componentIdHeader]: randomUUID(),
                [blueprintIdHeader]: blueprintId ?? randomUUID(),
                [nestLevelHeader]: +nestLevel + 1,
                "user-agent": request.headers["user-agent"],
                ...(request.headers["authorization"] && {
                  authorization: request.headers["authorization"],
                }),
                accept: "text/html",
                host: request.headers.host,
              },
              query: { ...(request.query as AnyObject) },
            }
          ),
      viewName: view.viewName,
      componentName: component.path,
      data: new Map(),
      request: request,
      reply: reply,
      api: axios.create({ baseURL: `/${component.path}/${view.viewName}` }),
      helpers: {
        ...userOpts.manifest.shared?.helpers,
        ...component.shared?.helpers,
        ...view.helpers,
      },
      deviceType: device.toUpperCase() as ComponentDevice,
      params: {
        headers: request.headers as AnyObject,
        path: request.params as AnyObject,
        query: request.query as AnyObject,
        body: request.body as AnyObject,
      },
    });
  }

  /**
   * Render the template
   * @param {ComponentContext<AnyObject, ComponentParams>} context - The context to render the template with.
   * @return {string | Promise<string> | Buffer | Promise<Buffer>} - The rendered template.
   * @protected
   * @author Zach Ayers
   */
  protected render(context: ComponentContext<AnyObject, ComponentParams>) {
    return renderTemplate(context);
  }
}
