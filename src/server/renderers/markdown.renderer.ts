import type {
  NodeAsset,
  ComponentPublicData,
} from "../../types/component.simple.types";
import type { ComponentRenderer } from "../../types/component.renderer";
import type { ComponentContext } from "../../types/component.context";
import type { ComponentParams } from "../../types/component.params";
import { Loggable } from "../abstract/loggable";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

/**
 * Markdown Renderer
 * @author Zach Ayers
 */
export class MarkdownRenderer extends Loggable implements ComponentRenderer {
  public vendorAssets: Array<NodeAsset> = [];

  /** @inheritDoc */
  public render(
    context: ComponentContext<ComponentPublicData, ComponentParams>
  ): string | Promise<string> | Buffer | Promise<Buffer> {
    const markdown: MarkdownIt = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return (
              '<pre class="hljs"><code>' +
              hljs.highlight(str, {
                language: lang,
                ignoreIllegals: true,
              }).value +
              "</code></pre>"
            );
          } catch (__) {}
        }

        return (
          '<pre class="hljs"><code>' +
          markdown.utils.escapeHtml(str) +
          "</code></pre>"
        );
      },
    });

    markdown.linkify.set({ fuzzyEmail: false });
    return markdown.render(context.template as string);
  }
}

export const MARKDOWN = new MarkdownRenderer();
