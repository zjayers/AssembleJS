import type { CssAsset } from "../../types/css.asset";
import type { BlueprintServerOptions } from "../../types/blueprint.server.options";
import type { RawTemplate } from "../../types/component.simple.types";
import type { ComponentView } from "../../types/component.view";
import type { JsAsset } from "../../types/js.asset.js";
import fs from "fs";
import path from "path";
import { ASSEMBLEJS } from "../config/blueprint.config";
import { checkFileExists } from "../../utils/file.utils";
import { parse } from "node-html-parser";
import { toBoolean } from "../../utils/boolean.utils";
import { convertExtsToDistPointer } from "../../utils/html.utils";
import { preRenderTemplate } from "../renderers/rendering/pre.render.template";

/**
 * Build all component views on the server side at startup and prep any cacheables.
 * @param {BlueprintServerOptions} userOpts - The user options to use.
 * @return {any} componentViews - The component views to use.
 * @author Zach Ayers
 */
export async function buildComponentViews(userOpts: BlueprintServerOptions) {
  // If there are no components defined in the manifest, return an empty array
  if (!userOpts.manifest.components || userOpts.manifest.components.length === 0) {
    return [];
  }

  return Promise.all(userOpts.manifest.components.map(async (component) => {
    // Get Root Path and check if it exists
    const componentRootPath = "./components";
    let rootPath = component.root ?? componentRootPath;
    let baseDirPath = path.join(ASSEMBLEJS.root, rootPath);
    
    // Just check if the directory exists without throwing an error
    if (!checkFileExists(baseDirPath)) {
      console.warn(`Warning: Component root path ${rootPath} does not exist at ${baseDirPath}`);
    }

    // Get component View Directory and check if it exists
    let componentViewDir = path.join(baseDirPath, component.path);

    // If file doesn't exist here, check the blueprints folder
    if (!checkFileExists(componentViewDir)) {
      rootPath = "./blueprints";
      baseDirPath = path.join(ASSEMBLEJS.root, rootPath);
      if (checkFileExists(baseDirPath)) {
        componentViewDir = path.join(baseDirPath, component.path);
      }
    }

    // If the component directory still doesn't exist, log a warning but don't fail
    if (!checkFileExists(componentViewDir)) {
      console.warn(`Warning: Component directory ${component.path} not found in ${rootPath}`);
      // Return a placeholder for this component to prevent errors
      return {
        ...component,
        views: component.views.map(view => ({
          ...view,
          template: "<div>Component not found</div>",
          getTemplate: () => "<div>Component not found</div>",
          root: component.path,
          manifestUrl: `/${component.path}/${view.viewName}/manifest/`,
          contentUrl: `/${component.path}/${view.viewName}/`,
          dataUrl: `/${component.path}/${view.viewName}/data/`,
          assets: { js: [], css: [] }
        }))
      };
    }

    return {
      ...component,
      views: await Promise.all(component.views.map(async (view) => {
        const viewDir = path.join(componentViewDir, view.viewName);
        
        // If the view directory doesn't exist, log a warning but don't fail
        if (!checkFileExists(viewDir)) {
          console.warn(`Warning: View directory ${view.viewName} not found in ${componentViewDir}`);
          // Return a placeholder view to prevent errors
          return {
            ...view,
            template: "<div>View not found</div>",
            getTemplate: () => "<div>View not found</div>",
            root: component.path,
            manifestUrl: `/${component.path}/${view.viewName}/manifest/`,
            contentUrl: `/${component.path}/${view.viewName}/`,
            dataUrl: `/${component.path}/${view.viewName}/data/`,
            assets: { js: [], css: [] }
          };
        }

        // Check type of view template
        const useFileLoader = view.templateFile !== undefined;
        const viewTemplateFilePath = path.join(
          viewDir,
          view.templateFile ?? ""
        );
        
        // If using a file loader, check if the template file exists
        if (useFileLoader && !checkFileExists(viewTemplateFilePath)) {
          console.warn(`Warning: Template file ${view.templateFile} not found in ${viewDir}`);
          // Return a placeholder view with a message
          return {
            ...view,
            template: `<div>Template file "${view.templateFile}" not found</div>`,
            getTemplate: () => `<div>Template file "${view.templateFile}" not found</div>`,
            root: component.path,
            manifestUrl: `/${component.path}/${view.viewName}/manifest/`,
            contentUrl: `/${component.path}/${view.viewName}/`,
            dataUrl: `/${component.path}/${view.viewName}/data/`,
            assets: { js: [], css: [] }
          };
        }

        // Sanitize scss and ts links in functional/class templates
        const getTemplate = useFileLoader
          ? () =>
              convertExtsToDistPointer(
                fs.readFileSync(viewTemplateFilePath).toString()
              )
          : () => view.template as RawTemplate;

        const renderableContext = <ComponentView>{
          ...view,
          template: getTemplate(),
          getTemplate,
          root: component.path,
          manifestUrl: `/${component.path}/${view.viewName}/manifest/`,
          contentUrl: `/${component.path}/${view.viewName}/`,
          dataUrl: `/${component.path}/${view.viewName}/data/`,
        };

        view.getTemplate = getTemplate;

        // Check Renderability and gather assets
        let rawTemplate = "";
        try {
          rawTemplate = await preRenderTemplate(userOpts, component, view);
        } catch (e) {
          throw new Error(
            `Template for view: '${view.viewName}' failed to pre-render...: \n${e}`
          );
        }

        // Parse HTML on Server Startup - pull out scripts and styles
        if (!rawTemplate) {
          console.error(
            `Empty template returned for component: ${component.path}, view: ${view.viewName}`
          );
          renderableContext.assets = { js: [], css: [] };
          return renderableContext;
        }

        // Ensure rawTemplate is a string
        let templateString = "<div>Error: Invalid template</div>";

        if (typeof rawTemplate === "string") {
          templateString = rawTemplate;
        } else if (rawTemplate) {
          try {
            // Check if toString method exists and use it
            if (typeof (rawTemplate as any).toString === "function") {
              templateString = (rawTemplate as any).toString();
            }
          } catch (err) {
            console.error("Error converting template to string:", err);
          }
        }

        const parsedHtml = parse(templateString);
        const scripts = parsedHtml.querySelectorAll("script");
        const styles = parsedHtml.querySelectorAll("link");

        renderableContext.assets = {
          js: scripts.map((el) => {
            const attrs = el.attrs;
            return {
              src: attrs["src"]
                ? `/${component.path}/${view.viewName}/${attrs["src"]}`.replace(
                    ".ts",
                    ".js"
                  )
                : "",
              ...(attrs["async"] !== undefined && {
                async:
                  attrs["async"].length === 0
                    ? true
                    : toBoolean(attrs["async"]),
              }),
              ...(attrs["crossorigin"] !== undefined && {
                crossorigin: attrs["crossorigin"] as JsAsset["crossorigin"],
              }),
              ...(attrs["defer"] !== undefined && {
                defer:
                  attrs["defer"].length === 0
                    ? true
                    : toBoolean(attrs["defer"]),
              }),
              ...(attrs["integrity"] !== undefined && {
                integrity: attrs["integrity"],
              }),
              ...(attrs["nomodule"] !== undefined && {
                nomodule:
                  attrs["nomodule"].length === 0
                    ? true
                    : toBoolean(attrs["nomodule"]),
              }),
              ...(attrs["referrerpolicy"] !== undefined && {
                referrerpolicy: attrs[
                  "referrerpolicy"
                ] as JsAsset["referrerpolicy"],
              }),
              ...(attrs["type"] !== undefined && { type: attrs["type"] }),
            };
          }),
          css: styles.map((el) => {
            const attrs = el.attrs;
            return {
              href: attrs["href"]
                ? `/${component.path}/${view.viewName}/${attrs["href"]}`
                : "",
              rel: (attrs["rel"] as CssAsset["rel"]) ?? "stylesheet",
              ...(attrs["crossorigin"] !== undefined && {
                crossorigin: attrs["crossorigin"] as CssAsset["crossorigin"],
              }),
              ...(attrs["disabled"] !== undefined && {
                disabled:
                  attrs["disabled"].length === 0
                    ? true
                    : toBoolean(attrs["disabled"]),
              }),
              ...(attrs["hreflang"] !== undefined && {
                hreflang: attrs["hreflang"],
              }),
              ...(attrs["media"] !== undefined && {
                media: attrs["media"] as CssAsset["media"],
              }),
              ...(attrs["type"] !== undefined && { type: attrs["type"] }),
            };
          }),
        };

        return renderableContext;
      })),
    };
  }) ?? []);
}
