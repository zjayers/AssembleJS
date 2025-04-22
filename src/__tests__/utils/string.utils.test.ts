import {
  isStringOfLength,
  defaultString,
  optionalString,
  optionalBlankString,
  toLowerCase,
  toUpperCase,
  coalesceIsEmpty,
  coalesceIsBlank,
  isEmpty,
  isNotEmpty,
  isBlank,
  isNotBlank,
  trimPunctuation,
  toDelimitedString,
  condenseSpace,
  replaceExtendedCharacters,
} from "../../utils/string.utils";

describe("String Utilities", () => {
  describe("isStringOfLength", () => {
    it("should return true when string length matches provided length", () => {
      expect(isStringOfLength("hello", 5)).toBe(true);
    });

    it("should return false when string length does not match provided length", () => {
      expect(isStringOfLength("hello", 4)).toBe(false);
    });

    it("should work with empty strings", () => {
      expect(isStringOfLength("", 0)).toBe(true);
    });
  });

  describe("defaultString", () => {
    it("should return the string if it is a valid string", () => {
      expect(defaultString("hello")).toBe("hello");
    });

    it("should return empty string if undefined is provided", () => {
      expect(defaultString(undefined)).toBe("");
    });

    it("should return empty string if null is provided", () => {
      expect(defaultString(null)).toBe("");
    });

    it("should return default value if provided and input is undefined", () => {
      expect(defaultString(undefined, "default")).toBe("default");
    });

    it("should convert non-string values to strings", () => {
      expect(defaultString(123)).toBe("123");
      expect(defaultString(true)).toBe("true");
      expect(defaultString(false)).toBe("false");
    });
  });

  describe("optionalString", () => {
    it("should return the string if it is not empty", () => {
      expect(optionalString("hello")).toBe("hello");
    });

    it("should return undefined if string is empty", () => {
      expect(optionalString("")).toBeUndefined();
    });

    it("should return undefined if input is undefined", () => {
      expect(optionalString(undefined)).toBeUndefined();
    });

    it("should return undefined if input is null", () => {
      expect(optionalString(null)).toBeUndefined();
    });
  });

  describe("optionalBlankString", () => {
    it("should return the string if it is not blank", () => {
      expect(optionalBlankString("hello")).toBe("hello");
    });

    it("should return undefined if string is blank (whitespace only)", () => {
      expect(optionalBlankString("   ")).toBeUndefined();
    });

    it("should return undefined if string is empty", () => {
      expect(optionalBlankString("")).toBeUndefined();
    });

    it("should return undefined if input is undefined", () => {
      expect(optionalBlankString(undefined)).toBeUndefined();
    });

    it("should return undefined if input is null", () => {
      expect(optionalBlankString(null)).toBeUndefined();
    });
  });

  describe("toLowerCase", () => {
    it("should convert string to lowercase", () => {
      expect(toLowerCase("HELLO")).toBe("hello");
    });

    it("should handle mixed case", () => {
      expect(toLowerCase("HeLLo")).toBe("hello");
    });

    it("should return empty string if undefined is provided", () => {
      expect(toLowerCase(undefined)).toBe("");
    });

    it("should return empty string if null is provided", () => {
      expect(toLowerCase(null)).toBe("");
    });

    it("should convert non-string values to lowercase strings", () => {
      expect(toLowerCase(123)).toBe("123");
    });
  });

  describe("toUpperCase", () => {
    it("should convert string to uppercase", () => {
      expect(toUpperCase("hello")).toBe("HELLO");
    });

    it("should handle mixed case", () => {
      expect(toUpperCase("HeLLo")).toBe("HELLO");
    });

    it("should return empty string if undefined is provided", () => {
      expect(toUpperCase(undefined)).toBe("");
    });

    it("should return empty string if null is provided", () => {
      expect(toUpperCase(null)).toBe("");
    });

    it("should convert non-string values to uppercase strings", () => {
      expect(toUpperCase(123)).toBe("123");
    });
  });

  describe("coalesceIsEmpty", () => {
    it("should return the first non-empty string", () => {
      expect(coalesceIsEmpty("", "hello", "world")).toBe("hello");
    });

    it("should skip undefined and null values", () => {
      expect(coalesceIsEmpty(undefined, null, "hello")).toBe("hello");
    });

    it("should return empty string if all values are empty", () => {
      expect(coalesceIsEmpty("", undefined, null, "")).toBe("");
    });

    it("should return the input string if it is not empty", () => {
      expect(coalesceIsEmpty("hello", "world")).toBe("hello");
    });
  });

  describe("coalesceIsBlank", () => {
    it("should return the first non-blank string", () => {
      expect(coalesceIsBlank("", "   ", "hello", "world")).toBe("hello");
    });

    it("should skip undefined and null values", () => {
      expect(coalesceIsBlank(undefined, null, "hello")).toBe("hello");
    });

    it("should return empty string if all values are blank", () => {
      expect(coalesceIsBlank("", "   ", undefined, null)).toBe("");
    });

    it("should return the input string if it is not blank", () => {
      expect(coalesceIsBlank("hello", "world")).toBe("hello");
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty strings", () => {
      expect(isEmpty("")).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return false for non-empty strings", () => {
      expect(isEmpty("hello")).toBe(false);
    });

    it("should return false for strings with whitespace", () => {
      expect(isEmpty("   ")).toBe(false);
    });

    it("should work with arrays", () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe("isNotEmpty", () => {
    it("should return false for empty strings", () => {
      expect(isNotEmpty("")).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isNotEmpty(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isNotEmpty(null)).toBe(false);
    });

    it("should return true for non-empty strings", () => {
      expect(isNotEmpty("hello")).toBe(true);
    });

    it("should return true for strings with whitespace", () => {
      expect(isNotEmpty("   ")).toBe(true);
    });

    it("should work with arrays", () => {
      expect(isNotEmpty([])).toBe(false);
      expect(isNotEmpty([1, 2, 3])).toBe(true);
    });
  });

  describe("isBlank", () => {
    it("should return true for empty strings", () => {
      expect(isBlank("")).toBe(true);
    });

    it("should return true for strings with only whitespace", () => {
      expect(isBlank("   ")).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isBlank(undefined)).toBe(true);
    });

    it("should return true for null", () => {
      expect(isBlank(null)).toBe(true);
    });

    it("should return false for non-blank strings", () => {
      expect(isBlank("hello")).toBe(false);
    });

    it("should work with arrays", () => {
      expect(isBlank([])).toBe(true);
      expect(isBlank([1, 2, 3])).toBe(false);
    });
  });

  describe("isNotBlank", () => {
    it("should return false for empty strings", () => {
      expect(isNotBlank("")).toBe(false);
    });

    it("should return false for strings with only whitespace", () => {
      expect(isNotBlank("   ")).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isNotBlank(undefined)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isNotBlank(null)).toBe(false);
    });

    it("should return true for non-blank strings", () => {
      expect(isNotBlank("hello")).toBe(true);
    });

    it("should work with arrays", () => {
      expect(isNotBlank([])).toBe(false);
      expect(isNotBlank([1, 2, 3])).toBe(true);
    });
  });

  describe("trimPunctuation", () => {
    it("should remove punctuation from a string", () => {
      expect(trimPunctuation("hello!")).toBe("hello");
    });

    it("should handle multiple punctuation marks", () => {
      expect(trimPunctuation("hello, world!")).toBe("hello, world");
    });

    it("should handle string without punctuation", () => {
      expect(trimPunctuation("hello world")).toBe("hello world");
    });

    it("should return empty string for undefined", () => {
      expect(trimPunctuation(undefined)).toBe("");
    });

    it("should return empty string for null", () => {
      expect(trimPunctuation(null)).toBe("");
    });
  });

  describe("toDelimitedString", () => {
    it("should join array elements with default delimiter", () => {
      expect(toDelimitedString([1, 2, 3])).toBe("1,2,3");
    });

    it("should join array elements with custom delimiter", () => {
      expect(toDelimitedString([1, 2, 3], "-")).toBe("1-2-3");
    });

    it("should join set elements with default delimiter", () => {
      const set = new Set([1, 2, 3]);
      expect(toDelimitedString(set)).toBe("1,2,3");
    });

    it("should join set elements with custom delimiter", () => {
      const set = new Set([1, 2, 3]);
      expect(toDelimitedString(set, "-")).toBe("1-2-3");
    });

    it("should handle empty arrays", () => {
      expect(toDelimitedString([])).toBe("");
    });

    it("should handle empty sets", () => {
      expect(toDelimitedString(new Set())).toBe("");
    });
  });

  describe("condenseSpace", () => {
    it("should replace multiple spaces with a single space", () => {
      expect(condenseSpace("hello  world")).toBe("hello world");
    });

    it("should condense multiple sections of spaces", () => {
      expect(condenseSpace("hello  world  and  universe")).toBe(
        "hello world and universe"
      );
    });

    it("should not change string without multiple spaces", () => {
      expect(condenseSpace("hello world")).toBe("hello world");
    });

    it("should handle extreme cases with many spaces", () => {
      expect(condenseSpace("hello            world")).toBe("hello world");
    });
  });

  describe("replaceExtendedCharacters", () => {
    it("should replace single quotes", () => {
      expect(replaceExtendedCharacters("\x91test\x92")).toBe("'test'");
      expect(replaceExtendedCharacters("'test'")).toBe("'test'");
    });

    it("should replace double quotes", () => {
      expect(replaceExtendedCharacters("\x93test\x94")).toBe('"test"');
      expect(
        replaceExtendedCharacters(
          String.fromCharCode(8220) + "test" + String.fromCharCode(8221)
        )
      ).toBe('"test"');
    });

    it("should replace dashes", () => {
      expect(replaceExtendedCharacters("test\x96test")).toBe("test-test");
      expect(replaceExtendedCharacters("test\x97test")).toBe("test-test");
    });

    it("should replace extended characters with their ASCII equivalents", () => {
      expect(replaceExtendedCharacters("\xe0\xe1\xe2")).toBe("aaa");
      expect(replaceExtendedCharacters("\xcc\xcd\xce\xcf")).toBe("IIII");
      expect(replaceExtendedCharacters("\xf9\xfa\xfb\xfc")).toBe("uuuu");
    });

    it("should handle multiple character types", () => {
      const input = "Caf\xe9 \x93Fran\xe7ais\x94 \x96 Open";
      expect(replaceExtendedCharacters(input)).toBe('Caf  "Francais" - Open');
    });

    it("should replace bullets with asterisks", () => {
      expect(
        replaceExtendedCharacters(String.fromCharCode(8226) + " Item")
      ).toBe("* Item");
    });

    it("should replace non-ASCII characters with spaces", () => {
      // This covers the case for characters beyond 7F
      expect(replaceExtendedCharacters("\u0080\u0081\u0082")).toBe("   ");
    });

    it("should remove control characters", () => {
      expect(replaceExtendedCharacters("\x00\x01\x02\x03")).toBe("   ");
    });
  });
});
