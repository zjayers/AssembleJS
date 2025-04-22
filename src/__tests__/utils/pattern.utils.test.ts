import {
  PATTERN_ALL_ZEROS,
  PATTERN_CURRENCY,
  PATTERN_DATE,
  PATTERN_DATE_SEPARATOR,
  PATTERN_HEX_DIGITS,
  PATTERN_HTML_TAG,
  PATTERN_PUNCTUATION,
  PATTERN_MULTIPLE_SPACES,
  isWildcardMatch,
} from "../../utils/pattern.utils";

describe("Pattern Utilities", () => {
  describe("PATTERN_ALL_ZEROS", () => {
    it("should match strings with all zeros", () => {
      expect("0").toMatch(PATTERN_ALL_ZEROS);
      expect("00").toMatch(PATTERN_ALL_ZEROS);
      expect("000000").toMatch(PATTERN_ALL_ZEROS);
    });

    it("should not match strings with non-zero characters", () => {
      expect("01").not.toMatch(PATTERN_ALL_ZEROS);
      expect("10").not.toMatch(PATTERN_ALL_ZEROS);
      expect("0a0").not.toMatch(PATTERN_ALL_ZEROS);
      expect(" 0 ").not.toMatch(PATTERN_ALL_ZEROS);
    });
  });

  describe("PATTERN_CURRENCY", () => {
    it("should match valid currency formats", () => {
      expect("$100.00").toMatch(PATTERN_CURRENCY);
      expect("$0.50").toMatch(PATTERN_CURRENCY);
      expect("$1,234.56").toMatch(PATTERN_CURRENCY);
      expect("$1,234,567.89").toMatch(PATTERN_CURRENCY);
      // The updated pattern requires a $ sign
      // expect('123.45').toMatch(PATTERN_CURRENCY);
      // expect('0.00').toMatch(PATTERN_CURRENCY);
      expect("$(123.45)").toMatch(PATTERN_CURRENCY); // Parenthesis indicate negative amount
      expect("$+100.00").toMatch(PATTERN_CURRENCY);
      expect("$-100.00").toMatch(PATTERN_CURRENCY);
    });

    it("should not match invalid currency formats", () => {
      expect("$100").not.toMatch(PATTERN_CURRENCY); // Missing cents
      expect("$100.0").not.toMatch(PATTERN_CURRENCY); // One decimal digit
      expect("$100.000").not.toMatch(PATTERN_CURRENCY); // Three decimal digits
      expect("100").not.toMatch(PATTERN_CURRENCY); // No decimal part
      expect("123.45").not.toMatch(PATTERN_CURRENCY); // Missing $ sign
      expect("0.00").not.toMatch(PATTERN_CURRENCY); // Missing $ sign
      expect("$,100.00").not.toMatch(PATTERN_CURRENCY); // Misplaced comma
      expect("$100.00.00").not.toMatch(PATTERN_CURRENCY); // Multiple decimal points
    });
  });

  describe("PATTERN_DATE", () => {
    it("should match dates in format MM-DD-YYYY", () => {
      expect("01-01-2020").toMatch(PATTERN_DATE);
      expect("12-31-1999").toMatch(PATTERN_DATE);
    });

    it("should match dates in format MM/DD/YYYY", () => {
      expect("01/01/2020").toMatch(PATTERN_DATE);
      expect("12/31/1999").toMatch(PATTERN_DATE);
    });

    it("should match dates in format MM.DD.YYYY", () => {
      expect("01.01.2020").toMatch(PATTERN_DATE);
      expect("12.31.1999").toMatch(PATTERN_DATE);
    });

    it("should not match invalid date formats", () => {
      expect("2020-01-01").not.toMatch(PATTERN_DATE); // YYYY-MM-DD
      expect("01 01 2020").not.toMatch(PATTERN_DATE); // Spaces as separators
      expect("1/1/2020").not.toMatch(PATTERN_DATE); // Missing leading zeros
      expect("Jan 1, 2020").not.toMatch(PATTERN_DATE); // Month name
    });
  });

  describe("PATTERN_DATE_SEPARATOR", () => {
    it("should match date separators (/, -, .)", () => {
      expect("/").toMatch(PATTERN_DATE_SEPARATOR);
      expect("-").toMatch(PATTERN_DATE_SEPARATOR);
      expect(".").toMatch(PATTERN_DATE_SEPARATOR);
    });

    it("should not match other characters", () => {
      expect(" ").not.toMatch(PATTERN_DATE_SEPARATOR);
      expect(",").not.toMatch(PATTERN_DATE_SEPARATOR);
      expect("a").not.toMatch(PATTERN_DATE_SEPARATOR);
    });
  });

  describe("PATTERN_HEX_DIGITS", () => {
    it("should match valid hexadecimal strings", () => {
      expect("0123456789abcdef").toMatch(PATTERN_HEX_DIGITS);
      expect("ABCDEF").toMatch(PATTERN_HEX_DIGITS);
      expect("0f").toMatch(PATTERN_HEX_DIGITS);
      expect("deadBEEF").toMatch(PATTERN_HEX_DIGITS);
    });

    it("should not match strings with non-hex characters", () => {
      expect("0123456789abcdefg").not.toMatch(PATTERN_HEX_DIGITS);
      expect("xyz").not.toMatch(PATTERN_HEX_DIGITS);
      expect("0x123").not.toMatch(PATTERN_HEX_DIGITS); // '0x' prefix not allowed
      expect(" abc").not.toMatch(PATTERN_HEX_DIGITS);
    });
  });

  describe("PATTERN_HTML_TAG", () => {
    it("should match basic HTML formatting tags", () => {
      expect("<b>").toMatch(PATTERN_HTML_TAG);
      expect("</b>").toMatch(PATTERN_HTML_TAG);
      expect("<i>").toMatch(PATTERN_HTML_TAG);
      expect("</i>").toMatch(PATTERN_HTML_TAG);
      expect("<u>").toMatch(PATTERN_HTML_TAG);
      expect("</u>").toMatch(PATTERN_HTML_TAG);
      expect("<br/>").toMatch(PATTERN_HTML_TAG);
      expect("<br />").toMatch(PATTERN_HTML_TAG);
    });

    it("should not match other HTML tags", () => {
      expect("<div>").not.toMatch(PATTERN_HTML_TAG);
      expect("<span>").not.toMatch(PATTERN_HTML_TAG);
      expect('<a href="">').not.toMatch(PATTERN_HTML_TAG);
      expect("<img>").not.toMatch(PATTERN_HTML_TAG);
    });

    it("should find all matching tags in a string", () => {
      const text =
        "This is <b>bold</b> and <i>italic</i> with a <br/> line break";
      const matches = text.match(PATTERN_HTML_TAG);
      expect(matches).toBeTruthy();
      if (matches) {
        expect(matches.length).toBe(5);
        expect(matches).toContain("<b>");
        expect(matches).toContain("</b>");
        expect(matches).toContain("<i>");
        expect(matches).toContain("</i>");
        expect(matches).toContain("<br/>");
      }
    });
  });

  describe("PATTERN_PUNCTUATION", () => {
    it("should match trailing punctuation", () => {
      const result1 = "Hello!".match(PATTERN_PUNCTUATION);
      expect(result1 && result1[0]).toBe("!");

      const result2 = "Hello.".match(PATTERN_PUNCTUATION);
      expect(result2 && result2[0]).toBe(".");

      const result3 = "Hello,".match(PATTERN_PUNCTUATION);
      expect(result3 && result3[0]).toBe(",");

      const result4 = "Hello?".match(PATTERN_PUNCTUATION);
      expect(result4 && result4[0]).toBe("?");

      const result5 = "Hello!!!".match(PATTERN_PUNCTUATION);
      expect(result5 && result5[0]).toBe("!!!");

      const result6 = "Hello?!".match(PATTERN_PUNCTUATION);
      expect(result6 && result6[0]).toBe("?!");
    });

    it("should not match punctuation that is not at the end", () => {
      expect("Hello, world").not.toMatch(PATTERN_PUNCTUATION);
      expect("Hello. World").not.toMatch(PATTERN_PUNCTUATION);
      expect("Hello! World!").toMatch(PATTERN_PUNCTUATION); // Matches the last !
    });
  });

  describe("PATTERN_MULTIPLE_SPACES", () => {
    it("should match two or more consecutive spaces", () => {
      const result1 = "  ".match(PATTERN_MULTIPLE_SPACES);
      expect(result1).toBeTruthy();
      expect(result1 && result1[0]).toBe("  ");

      const result2 = "   ".match(PATTERN_MULTIPLE_SPACES);
      expect(result2).toBeTruthy();
      expect(result2 && result2[0]).toBe("   ");

      const result3 = "Hello  world".match(PATTERN_MULTIPLE_SPACES);
      expect(result3).toBeTruthy();
      expect(result3 && result3[0]).toBe("  ");

      const result4 = "Hello    world    !".match(PATTERN_MULTIPLE_SPACES);
      expect(result4).toBeTruthy();
      expect(result4 && result4.length).toBe(2);
      expect(result4 && result4[0]).toBe("    ");
      expect(result4 && result4[1]).toBe("    ");
    });

    it("should not match single spaces", () => {
      expect("Hello world").not.toMatch(PATTERN_MULTIPLE_SPACES);
      expect(" Hello world ").not.toMatch(PATTERN_MULTIPLE_SPACES);
    });
  });

  describe("isWildcardMatch", () => {
    it("should match exact strings", () => {
      expect(isWildcardMatch("/api/users", "/api/users")).toBe(true);
      expect(isWildcardMatch("hello", "hello")).toBe(true);
    });

    it("should match strings with * wildcard", () => {
      expect(isWildcardMatch("/api/users/123", "/api/users/*")).toBe(true);
      expect(isWildcardMatch("/api/users/abc/profile", "/api/users/*")).toBe(
        true
      );
      expect(isWildcardMatch("prefix-middle-suffix", "prefix-*-suffix")).toBe(
        true
      );
      expect(isWildcardMatch("anything", "*")).toBe(true);
      expect(isWildcardMatch("starts-with-this", "starts-*")).toBe(true);
      expect(isWildcardMatch("ends-with-this", "*-this")).toBe(true);
    });

    it("should match strings with ? wildcard", () => {
      expect(isWildcardMatch("file1.txt", "file?.txt")).toBe(true);
      expect(isWildcardMatch("fileA.txt", "file?.txt")).toBe(true);
      expect(isWildcardMatch("hello", "h?llo")).toBe(true);
    });

    it("should match strings with combined * and ? wildcards", () => {
      expect(isWildcardMatch("/api/v1/users/123", "/api/v?/users/*")).toBe(
        true
      );
      expect(isWildcardMatch("report_2023_q4.pdf", "report_*_q?.pdf")).toBe(
        true
      );
    });

    it("should not match non-matching patterns", () => {
      expect(isWildcardMatch("/api/admin", "/api/users/*")).toBe(false);
      expect(isWildcardMatch("file10.txt", "file?.txt")).toBe(false);
      expect(isWildcardMatch("hello", "hello!")).toBe(false);
    });

    it("should handle regex special characters in patterns", () => {
      expect(isWildcardMatch("hello[world]", "hello[world]")).toBe(true);
      expect(isWildcardMatch("hello.world", "hello.world")).toBe(true);
      expect(isWildcardMatch("hello+world", "hello+world")).toBe(true);
      expect(isWildcardMatch("price: $10.99", "price: $*")).toBe(true);
    });
  });
});
