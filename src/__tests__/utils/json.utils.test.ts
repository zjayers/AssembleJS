import { encodeJson } from "../../utils/json.utils";

describe("JSON Utilities", () => {
  describe("encodeJson", () => {
    test("should correctly encode a simple object", () => {
      const input = { name: "John", age: 30 };
      const encoded = encodeJson(input);
      expect(encoded).toBe('{"name":"John","age":30}');
    });

    test("should encode less-than signs properly", () => {
      const input = { script: '<script>alert("XSS")</script>' };
      const encoded = encodeJson(input);
      // Check that the < sign is encoded as \u003c
      expect(encoded).toBe(
        '{"script":"\\u003cscript>alert(\\"XSS\\")\\u003c/script>"}'
      );
      // Double check that the encoding works as expected
      expect(encoded).not.toContain("<");
      expect(encoded).toContain("\\u003c");
    });

    test("should handle nested objects", () => {
      const input = {
        user: {
          name: "John",
          html: "<p>This is HTML content</p>",
        },
        active: true,
      };
      const encoded = encodeJson(input);
      expect(encoded).toContain("\\u003cp>");
      expect(encoded).toContain("\\u003c/p>");
      // Validate that the encoding can be parsed back to original object
      expect(JSON.parse(encoded)).toEqual(input);
    });

    test("should handle arrays", () => {
      const input = {
        tags: ["html", "<tag>", "js"],
      };
      const encoded = encodeJson(input);
      expect(encoded).toContain("\\u003ctag>");
      expect(JSON.parse(encoded)).toEqual(input);
    });

    test("should handle special characters in keys", () => {
      const input = {
        "<key>": "value",
        normal: "<value>",
      };
      const encoded = encodeJson(input);
      expect(encoded).toContain('"\\u003ckey>"');
      expect(encoded).toContain('"\\u003cvalue>"');
      expect(JSON.parse(encoded)).toEqual(input);
    });

    test("should handle null and undefined values", () => {
      const input = {
        nullValue: null,
        undefinedKey: undefined,
        emptyString: "",
      };
      const encoded = encodeJson(input);

      // Note: JSON.stringify drops keys with undefined values
      const expectedEncoded = '{"nullValue":null,"emptyString":""}';
      expect(encoded).toBe(expectedEncoded);

      // The parsed result should match what JSON.stringify does
      const parsedBack = JSON.parse(encoded);
      expect(parsedBack).toHaveProperty("nullValue", null);
      expect(parsedBack).toHaveProperty("emptyString", "");
      expect(parsedBack).not.toHaveProperty("undefinedKey");
    });

    test("should handle empty objects", () => {
      const input = {};
      const encoded = encodeJson(input);
      expect(encoded).toBe("{}");
    });
  });
});
