import type { Assembly } from "../../types/blueprint.simple.types";
import type { ViewContext } from "../../types/component.context";
import type {
  BlueprintDevServer,
  BlueprintServerOptions,
} from "../../types/blueprint.server.options";
import type { ComponentView } from "../../types/component.view";
import type { ComponentFactory } from "../../types/component.factory";
import type { ComponentParams } from "../../types/component.params";
import type { Component } from "../../types/component";
import { ComponentController } from "../abstract/component.controller";
import type { FastifyReply } from "fastify";
import { ASSEMBLEJS } from "../config/blueprint.config";
import { combine } from "../../utils/object.utils";
import { encodeHtml } from "../../utils/html.utils";
import { encodeJson } from "../../utils/json.utils";
import { getSafeContext } from "../../utils/context.utils";
import {
  cacheRenderedComponent,
  getCachedRenderedComponent,
  isStaticAsset,
} from "../../utils/component.utils";
import type { AnyObject } from "../../types/object.any";

/**
 * This controller is the entrypoint for the CONTENT of a Component/Blueprint.
 * @todo optimize, optimize, optimize
 * @author Zach Ayers
 */
export class ContentController extends ComponentController {
  /** @inheritDoc */
  public register(
    app: Assembly,
    userOpts: BlueprintServerOptions,
    component: Component,
    view: ComponentView,
    devServer: BlueprintDevServer
  ) {
    const factorySortCriteria = (
      a: ComponentFactory<AnyObject, ComponentParams>,
      b: ComponentFactory<AnyObject, ComponentParams>
    ) => (a.priority ?? 0) - (b.priority ?? 0);
    const globalFactories =
      userOpts.manifest.shared?.factories?.sort(factorySortCriteria) ?? [];
    const componentFactories =
      component.shared?.factories?.sort(factorySortCriteria) ?? [];
    const viewFactories = view.factories?.sort(factorySortCriteria) ?? [];

    app.get<{
      Querystring: { DATA_ONLY?: boolean };
      headers: { "x-assemblejs-blueprint-id"?: string };
    }>(
      `/${component.path}/${view.viewName}/`,
      {
        schema: {
          params: combine(
            userOpts.manifest.shared?.paramsSchema?.path ?? {},
            component.shared?.paramsSchema?.path ?? {},
            view.paramsSchema?.path ?? {}
          ),
          headers: combine(
            userOpts.manifest.shared?.paramsSchema?.headers ?? {},
            component.shared?.paramsSchema?.headers ?? {},
            view.paramsSchema?.headers ?? {}
          ),
          querystring: combine(
            userOpts.manifest.shared?.paramsSchema?.query ?? {},
            component.shared?.paramsSchema?.query ?? {},
            view.paramsSchema?.query ?? {}
          ),
        },
        // TODO, finalize auth patterns. There is basic auth when deployed for now.
        ...(!view.exposeAsBlueprint &&
          !ASSEMBLEJS.isLocal() && { preHandler: app.auth([app.basicAuth]) }),
        ...userOpts.manifest.shared?.routeOpts,
        ...component.shared?.routeOpts,
        ...view.routeOpts,
      },
      async (request, reply: FastifyReply) => {
        const DATA_ONLY = request.query.DATA_ONLY;
        const requestUrl = request.url;

        // For static assets, don't use caching here
        if (isStaticAsset(requestUrl)) {
          return reply.type("text/html").send("");
        }

        // Generate a cache key based on the URL and query parameters
        const cacheKey = `${component.path}:${view.viewName}:${requestUrl}`;

        // Check if we have a cached version and caching is enabled
        if (app.caches && !DATA_ONLY && !ASSEMBLEJS.isLocal()) {
          const cachedContent = getCachedRenderedComponent(app, cacheKey);

          if (cachedContent) {
            // Add cache hit header
            reply.header("X-Cache", "HIT");
            return reply.type("text/html").send(Buffer.from(cachedContent));
          }

          // Mark as cache miss
          reply.header("X-Cache", "MISS");
        }

        // Build the Node Context
        const context = await this.buildComponentContext(
          view,
          app,
          userOpts,
          component,
          request,
          reply,
          DATA_ONLY
        );

        // Run Factories
        await this.runFactories(context, {
          global: globalFactories,
          component: componentFactories,
          view: viewFactories,
        });

        // If requesting data only, send back the public data.
        if (DATA_ONLY) {
          return reply.type("application/json").send(context.data);
        }

        // Inject any development wrappers to blueprints
        if (
          context.renderAsBlueprint &&
          view.template &&
          this.injectDevelopmentItems
        ) {
          // Wait for the injected template since it's now an async operation
          const injectedTemplate = await this.injectDevelopmentItems(
            context,
            component,
            view
          );
          if (injectedTemplate) {
            context.overrideTemplate(injectedTemplate);
          }
        }

        // When local, always grab the newest template so HMR works effectively
        if (ASSEMBLEJS.isLocal() && view.getTemplate) {
          context.overrideTemplate(view.getTemplate());
        }

        // Finally, render the UI component
        let html: string | Buffer = await this.render(context);

        // Check if we need to inject the dev panel after rendering
        // This is for Preact components where the panel needs to be injected into the rendered HTML
        if (
          (context as any).__injectDevPanel === true &&
          typeof html === "string" &&
          html.includes("</body>")
        ) {
          try {
            const panelModulePath = "../../developer/panel/index.js";
            const panelModule = await import(panelModulePath);

            if (
              panelModule &&
              typeof panelModule.injectDevPanel === "function"
            ) {
              html = panelModule.injectDevPanel(
                html,
                context.id,
                component.path,
                view.viewName
              );
            }
          } catch (error) {
            app.log.error(
              `Post-render injection failed: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }

        // Build a sanitized context object that may be exposed to the client
        const safeContext: ViewContext = getSafeContext(context);

        // Encode the component data
        const encodedId = encodeHtml(context.id);
        const encodedNodeName = encodeHtml(component.path);
        const encodedViewName = encodeHtml(context.viewName);
        const encodedClassNames =
          view.htmlContainerCssClassNames
            ?.map((className) => encodeHtml(className))
            .join(" ") ?? [];
        const encodedAttrs =
          view.htmlContainerAttributes
            ?.map((className) => encodeHtml(className))
            .join(" ") ?? [];

        // Build the data loader
        html = `${html}<script id="${
          ASSEMBLEJS.dataIdPrefix
        }${encodedId}" type="application/json">${encodeJson(
          safeContext
        )}</script>`;

        // If rendering as a component, include the encapsulation HTML & serialized context DTO
        if (!context.renderAsBlueprint) {
          html = `<${ASSEMBLEJS.htmlWrapperTag} ${ASSEMBLEJS.componentUrlIdentifier}="${context.serverUrl}" ${ASSEMBLEJS.componentIdIdentifier}="${encodedId}" ${ASSEMBLEJS.componentNameIdentifier}="${encodedNodeName}" ${ASSEMBLEJS.componentViewIdentifier}="${encodedViewName}" ${ASSEMBLEJS.componentNestIdentifier}="${context.nestLevel}" ${ASSEMBLEJS.componentDataIdentifier}="${encodedId}" class="${ASSEMBLEJS.componentClassIdentifier} ${encodedNodeName} ${encodedViewName} ${encodedClassNames}" ${encodedAttrs}>${html}</${ASSEMBLEJS.htmlWrapperTag}>`;
        }

        // Vite HMR Injection
        if (ASSEMBLEJS.isLocal() && context.renderAsBlueprint) {
          if (!devServer) {
            throw new Error("AssembleJS Dev server not found!");
          }

          html = await devServer.transformIndexHtml(
            request.url,
            html.toString()
          );
        }

        // Cache the rendered content if caching is enabled and not in development mode
        if (app.caches && !ASSEMBLEJS.isLocal()) {
          // Cache the rendered HTML with a default TTL of 5 minutes
          // Views can override this by setting their own TTL in the view configuration
          const cacheTtl = view.cacheTtl || 300000; // 5 minutes default
          cacheRenderedComponent(app, cacheKey, html.toString(), cacheTtl);
        }

        return reply.type("text/html").send(Buffer.from(html));
      }
    );
  }
}
