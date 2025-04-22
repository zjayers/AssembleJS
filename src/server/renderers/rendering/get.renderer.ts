import type { ComponentContext } from "../../../types/component.context";
import type { AnyObject } from "../../../types/object.any";
import type { ComponentParams } from "../../../types/component.params";
import type { ComponentRenderer } from "../../../types/component.renderer";
import path from "path";

// Core renderers that are used commonly and should be loaded eagerly
import { EJS } from "../ejs.renderer";
import { STRING } from "../string.renderer";
import { PREACT } from "../preact.renderer";
import { MARKDOWN } from "../markdown.renderer";

// Cache for lazy-loaded renderers
const rendererCache: Record<string, ComponentRenderer> = {
  EJS,
  HTML: STRING,
  STRING,
  PREACT,
  MARKDOWN,
};

/**
 * Lazily load a renderer by name to avoid initializing unused renderers
 * @param {string} rendererName - The name of the renderer to load
 * @return {Promise<ComponentRenderer>} The loaded renderer
 */
async function lazyLoadRenderer(
  rendererName: string
): Promise<ComponentRenderer> {
  if (rendererCache[rendererName]) {
    return rendererCache[rendererName];
  }

  try {
    // Dynamically import the required renderer
    let importedRenderer;
    switch (rendererName) {
      case "REACT":
        importedRenderer = await import("../react.renderer");
        rendererCache[rendererName] = importedRenderer.REACT;
        break;
      case "VUE":
        importedRenderer = await import("../vue.renderer");
        rendererCache[rendererName] = importedRenderer.VUE;
        break;
      case "SVELTE":
        importedRenderer = await import("../svelte.renderer");
        rendererCache[rendererName] = importedRenderer.SVELTE;
        break;
      case "NUNJUCKS":
        importedRenderer = await import("../nunjucks.renderer");
        rendererCache[rendererName] = importedRenderer.NUNJUCKS;
        break;
      case "HANDLEBARS":
        importedRenderer = await import("../handlebars.renderer");
        rendererCache[rendererName] = importedRenderer.HANDLEBARS;
        break;
      case "PUG":
        importedRenderer = await import("../pug.renderer");
        rendererCache[rendererName] = importedRenderer.PUG;
        break;
      case "WEBCOMPONENT":
        importedRenderer = await import("../webcomponent.renderer");
        rendererCache[rendererName] = importedRenderer.WEBCOMPONENT;
        break;
      default:
        throw new Error(`Unknown renderer: ${rendererName}`);
    }

    return rendererCache[rendererName];
  } catch (error) {
    console.error(`Error loading renderer ${rendererName}:`, error);
    throw new Error(
      `Failed to load renderer ${rendererName}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Get the required renderer based on the 'template' or 'templatePath' variables.
 * Here we can make assumptions about the file-type and set the renderer accordingly.
 * Uses lazy loading to only load renderers when needed.
 *
 * @param {Partial<Pick<ComponentContext<AnyObject, ComponentParams>, "template" | "templateFile" | "renderer">>} context
 * @return {Promise<ComponentRenderer>} The appropriate renderer for the given template
 * @author Zach Ayers
 */
export async function getRenderer(
  context: Partial<
    Pick<
      ComponentContext<AnyObject, ComponentParams>,
      "template" | "templateFile" | "renderer"
    >
  >
): Promise<ComponentRenderer> {
  // Check if we are using a file loader
  // This section is where we can import templates from file paths.
  // i.e. (html files, ejs files, etc.)
  if (context.templateFile !== undefined) {
    const ext = path.extname(context.templateFile);
    switch (ext) {
      case ".ejs":
        context.renderer = "EJS";
        return rendererCache.EJS;
      case ".html":
        context.renderer = "HTML";
        return rendererCache.HTML;
      case ".md":
        context.renderer = "MARKDOWN";
        return rendererCache.MARKDOWN;
      case ".jsx":
      case ".tsx":
        // Check the renderer preference in the context
        if (context.renderer === "REACT") {
          return await lazyLoadRenderer("REACT");
        }
        // Default to Preact for backwards compatibility
        context.renderer = "PREACT";
        return rendererCache.PREACT;
      case ".vue":
        context.renderer = "VUE";
        return await lazyLoadRenderer("VUE");
      case ".svelte":
        context.renderer = "SVELTE";
        return await lazyLoadRenderer("SVELTE");
      case ".njk":
      case ".nunjucks":
        context.renderer = "NUNJUCKS";
        return await lazyLoadRenderer("NUNJUCKS");
      case ".hbs":
      case ".handlebars":
        context.renderer = "HANDLEBARS";
        return await lazyLoadRenderer("HANDLEBARS");
      case ".pug":
      case ".jade": // Legacy extension for Pug
        context.renderer = "PUG";
        return await lazyLoadRenderer("PUG");
      case ".wc":
      case ".web-component":
      case ".webcomponent":
        context.renderer = "WEBCOMPONENT";
        return await lazyLoadRenderer("WEBCOMPONENT");
    }

    throw new Error(`No renderer found for file type: '${ext}'`);
  } else if (context.template !== undefined) {
    // Else, use the raw template loader
    // This section is where we can import templates directly via code.
    // i.e. (template strings, jsx elements, etc.)
    switch (typeof context.template) {
      case "string":
        // Check if an explicit renderer is specified
        if (context.renderer) {
          switch (context.renderer) {
            case "NUNJUCKS":
              return await lazyLoadRenderer("NUNJUCKS");
            case "HANDLEBARS":
              return await lazyLoadRenderer("HANDLEBARS");
            case "PUG":
              return await lazyLoadRenderer("PUG");
            case "EJS":
              return rendererCache.EJS;
            case "MARKDOWN":
              return rendererCache.MARKDOWN;
            case "WEBCOMPONENT":
              return await lazyLoadRenderer("WEBCOMPONENT");
          }
        }
        // Default string renderer
        context.renderer = "STRING";
        return rendererCache.STRING;
      case "function":
        // Check the renderer preference in the context
        if (context.renderer === "REACT") {
          return await lazyLoadRenderer("REACT");
        }
        // Default to Preact for backwards compatibility
        context.renderer = "PREACT";
        return rendererCache.PREACT;
      case "object":
        // Determine if it's a Vue or Svelte component
        if (context.renderer === "VUE") {
          return await lazyLoadRenderer("VUE");
        } else if (context.renderer === "SVELTE") {
          return await lazyLoadRenderer("SVELTE");
        }
        // Try to auto-detect component type
        if (
          (context.template as any).render &&
          typeof (context.template as any).render === "function"
        ) {
          context.renderer = "SVELTE";
          return await lazyLoadRenderer("SVELTE");
        } else {
          context.renderer = "VUE";
          return await lazyLoadRenderer("VUE");
        }
    }

    throw new Error(
      `No renderer found for variable type: '${typeof context.template}'`
    );
  }

  throw new Error(
    `No render-able template or templateFile was provided to the rendering engine.`
  );
}
