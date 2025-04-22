/**
 * Programmatic representation of a CSS link tag.
 * @description Assets built using this interface may be passed to the AssembleJS Link Builder
 * to create a consumable link tag.
 * @category (Face) [Assets]
 * @author Zach Ayers
 * @public
 * @example
 * ```typescript
 * // Create a new CSS Asset
 * const cssAsset: CssAsset = {
 *   href:
 *     "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
 *   crossorigin: 'anonymous',
 *   rel: 'stylesheet',
 *   media: 'all',
 * }
 * ```
 */
export interface CssAsset {
  /** The priority in which to place this asset in the document - Lower numbers are processed first */
  readonly priority?: number;
  /** Specifies the URL of an external style file */
  readonly href: string;
  /** Specifies how the element handles cross-origin requests */
  readonly crossorigin?: "anonymous" | "use-credentials";
  /** Sets or returns whether the linked document is disabled, or not */
  readonly disabled?: boolean;
  /** Specifies the language of the text in the linked document {@link https://www.w3schools.com/tags/ref_language_codes.asp} */
  readonly hreflang?: string;
  /** Specifies on what device the linked document will be displayed */
  readonly media?: /** For all devices. This is default */
  | "all"
    /** For speech synthesizers */
    | "aural"
    /** For Braille tactile feedback devices */
    | "braille"
    /** For paged Braille printers */
    | "embossed"
    /** For handheld devices */
    | "handheld"
    /** For printed pages and print preview */
    | "print"
    /** For projectors or transparencies */
    | "projection"
    /** For color computer screens */
    | "screen"
    /** For speech synthesizers */
    | "speech"
    /** For teletype devices */
    | "tty"
    /** For TV-type devices; */
    | "tv";
  /** Required. Specifies the relationship between the current document and the linked document */
  readonly rel: /** Linked page is an alternative version of the current document */
  | "alternate"
    /** Linked page is the appendix page for the current document */
    | "appendix"
    /** Refers to a chapter */
    | "chapter"
    /** Linked page is the table of contents for the current document */
    | "contents"
    /** Linked page is the copyright/policy for the current document */
    | "copyright"
    /** Linked page is the glossary page for the current document */
    | "glossary"
    /** Linked page is the help page for the current document */
    | "help"
    /** Refers to an icon location */
    | "icon"
    /** Linked page is the index page for the current document */
    | "index"
    /** Refers to the next page */
    | "next"
    /** Refers to a location that contains a path to the CDF file */
    | "offline"
    /** Refers to the previous page */
    | "prev"
    /** Refers to an XML file in OpenSearch description format */
    | "search"
    /** Link to a section in a list of documents */
    | "section"
    /** Refers to the bookmark panel */
    | "sidebar"
    /** Refers to the first page (used by search engines to show the first page) */
    | "start"
    /** Linked page is the style sheet for the current document */
    | "stylesheet"
    /** Linked page is a subsection for the current document */
    | "subsection";
  /** The MIME type of the linked document.
   Look at {@link http://www.iana.org/assignments/media-types/media-types.xhtml}
   for a complete list of standard MIME types */
  readonly type?: string;
}
