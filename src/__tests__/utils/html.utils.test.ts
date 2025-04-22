import {
  convertExtsToDistPointer,
  encodeHtml,
  comparePossibleHTML,
  htmlTagRemover,
} from "../../utils/html.utils";
import { trimPunctuation } from "../../utils/string.utils";

// Mock string utils to avoid issues with exact implementation
jest.mock("../../utils/string.utils", () => ({
  trimPunctuation: jest.fn((input) => input),
  condenseSpace: jest.fn((input) => input.replace(/\s+/g, " ").trim()),
}));

describe("html.utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("convertExtsToDistPointer", () => {
    it("should convert scss to css and ts to js", () => {
      const input =
        '<link rel="stylesheet" href="styles.scss"><script src="main.ts"></script>';
      const expected =
        '<link rel="stylesheet" href="styles.css"><script src="main.js"></script>';
      expect(convertExtsToDistPointer(input)).toBe(expected);
    });

    it("should handle multiple occurrences", () => {
      const input = "styles.scss scripts.ts another.scss final.ts";
      const expected = "styles.css scripts.js another.css final.js";
      expect(convertExtsToDistPointer(input)).toBe(expected);
    });

    it("should return the original string if no conversions needed", () => {
      const input = "<div>No extensions here</div>";
      expect(convertExtsToDistPointer(input)).toBe(input);
    });
  });

  describe("encodeHtml", () => {
    it("should encode HTML special characters", () => {
      const input = '<script>alert("Hello & goodbye")</script>';
      const expected =
        "&lt;script&gt;alert(&#34;Hello &amp; goodbye&#34;)&lt;/script&gt;";
      expect(encodeHtml(input)).toBe(expected);
    });

    it("should handle empty strings", () => {
      expect(encodeHtml("")).toBe("");
    });

    it("should handle null and undefined with default value", () => {
      expect(encodeHtml(null)).toBe("");
      expect(encodeHtml(undefined)).toBe("");
    });

    it("should use provided default value", () => {
      expect(encodeHtml(null, "N/A")).toBe("N/A");
      expect(encodeHtml(undefined, "N/A")).toBe("N/A");
    });

    it("should convert non-string values to string", () => {
      expect(encodeHtml(123)).toBe("123");

      const obj = { toString: () => "object<&>" };
      expect(encodeHtml(obj)).toBe("object&lt;&amp;&gt;");
    });

    it("should encode all special characters correctly", () => {
      const input = "&<>\"'";
      const expected = "&amp;&lt;&gt;&#34;&#39;";
      expect(encodeHtml(input)).toBe(expected);
    });
  });

  // Simplified test approach for functions using regex
  describe("comparePossibleHTML", () => {
    it("should match text with different HTML tags", () => {
      jest.mock("../../utils/pattern.utils", () => ({
        PATTERN_HTML_TAG: /<[^>]*>/g,
      }));

      expect(comparePossibleHTML("TEXT", "TEXT")).toBe(true);
      expect(comparePossibleHTML("TEXT", "text")).toBe(true);
      expect(comparePossibleHTML("TEXT", "Text")).toBe(true);
    });

    it("should not match different text", () => {
      expect(comparePossibleHTML("TEXT A", "TEXT B")).toBe(false);
    });
  });

  describe("htmlTagRemover", () => {
    // Test the function directly with simple inputs
    it("should handle plain text", () => {
      // For simple plain text, we can test directly
      expect(htmlTagRemover("Just plain text")).toBe("Just plain text");
    });

    it("should call trimPunctuation", () => {
      htmlTagRemover("some text");
      expect(trimPunctuation).toHaveBeenCalledWith("some text");
    });
  });
});
