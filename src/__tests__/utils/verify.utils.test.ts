import {
  verifyDate,
  verifyText,
  verifyBoolean,
  verifyBinary,
  verifyHexidecimal,
  verifyCurrency,
} from "../../utils/verify.utils";

describe("verify.utils", () => {
  describe("verifyDate", () => {
    it("should validate correctly formatted dates", () => {
      expect(verifyDate("01/15/2023")).toBe(true);
      expect(verifyDate("01-15-2023")).toBe(true);
      expect(verifyDate("01.15.2023")).toBe(true);
      expect(verifyDate("12/31/2023")).toBe(true);
    });

    it("should reject dates with invalid format", () => {
      expect(verifyDate("2023/01/15")).toBe(false); // Year first is not supported
      expect(verifyDate("15/01/2023")).toBe(false); // Day first is not supported
      expect(verifyDate("01 15 2023")).toBe(false); // Space separator not supported
      expect(verifyDate("Jan 15, 2023")).toBe(false); // Text month not supported
    });

    it("should reject dates with all zeros in any component", () => {
      expect(verifyDate("00/15/2023")).toBe(false);
      expect(verifyDate("01/00/2023")).toBe(false);
      expect(verifyDate("01/15/0000")).toBe(false);
    });

    it("should reject dates with invalid month or day values", () => {
      expect(verifyDate("13/15/2023")).toBe(false); // Invalid month
      expect(verifyDate("01/32/2023")).toBe(false); // Invalid day
      expect(verifyDate("02/30/2023")).toBe(false); // Invalid day for February
      expect(verifyDate("02/29/2023")).toBe(false); // Not a leap year
    });

    it("should validate leap year dates correctly", () => {
      expect(verifyDate("02/29/2020")).toBe(true); // 2020 is a leap year
      expect(verifyDate("02/29/2100")).toBe(false); // 2100 is not a leap year
    });
  });

  describe("verifyText", () => {
    it("should validate text within length constraints", () => {
      expect(verifyText("hello", 1, 10)).toBe(true);
      expect(verifyText("hello", 5, 5)).toBe(true);
      expect(verifyText("hello", 0, 10)).toBe(true);
    });

    it("should reject text outside length constraints", () => {
      expect(verifyText("hello", 6, 10)).toBe(false); // Too short
      expect(verifyText("hello", 1, 4)).toBe(false); // Too long
    });

    it("should validate when only min length is specified", () => {
      expect(verifyText("hello", 1)).toBe(true);
      expect(verifyText("hello", 6)).toBe(false);
    });

    it("should validate when only max length is specified", () => {
      expect(verifyText("hello", undefined, 10)).toBe(true);
      expect(verifyText("hello", undefined, 4)).toBe(false);
    });

    it("should validate when no constraints are specified", () => {
      expect(verifyText("hello")).toBe(true);
      expect(verifyText("")).toBe(true);
    });
  });

  describe("verifyBoolean", () => {
    it("should validate actual boolean values", () => {
      expect(verifyBoolean(true)).toBe(true);
      expect(verifyBoolean(false)).toBe(true);
    });

    it("should validate string boolean representations", () => {
      expect(verifyBoolean("true")).toBe(true);
      expect(verifyBoolean("false")).toBe(true);
      expect(verifyBoolean("TRUE")).toBe(true);
      expect(verifyBoolean("FALSE")).toBe(true);
      expect(verifyBoolean("True")).toBe(true);
      expect(verifyBoolean("False")).toBe(true);
    });

    it("should reject non-boolean strings", () => {
      expect(verifyBoolean("yes")).toBe(false);
      expect(verifyBoolean("no")).toBe(false);
      expect(verifyBoolean("1")).toBe(false);
      expect(verifyBoolean("0")).toBe(false);
      expect(verifyBoolean("")).toBe(false);
    });
  });

  describe("verifyBinary", () => {
    it("should validate binary numbers", () => {
      expect(verifyBinary(0)).toBe(true);
      expect(verifyBinary(1)).toBe(true);
    });

    it("should validate binary strings", () => {
      expect(verifyBinary("0")).toBe(true);
      expect(verifyBinary("1")).toBe(true);
    });

    it("should reject non-binary values", () => {
      expect(verifyBinary(2)).toBe(false);
      expect(verifyBinary(-1)).toBe(false);
      expect(verifyBinary("2")).toBe(false);
      expect(verifyBinary("")).toBe(false);
      expect(verifyBinary("true")).toBe(false);
    });
  });

  describe("verifyHexidecimal", () => {
    it("should validate hexadecimal strings", () => {
      expect(verifyHexidecimal("0123456789abcdef")).toBe(true);
      expect(verifyHexidecimal("0123456789ABCDEF")).toBe(true);
      expect(verifyHexidecimal("deadbeef")).toBe(true);
      expect(verifyHexidecimal("DEADBEEF")).toBe(true);
      expect(verifyHexidecimal("123abc")).toBe(true);
    });

    it("should reject non-hexadecimal strings", () => {
      expect(verifyHexidecimal("ghijklm")).toBe(false);
      expect(verifyHexidecimal("0x123")).toBe(false); // The 'x' is not a hexadecimal digit
      expect(verifyHexidecimal("")).toBe(false);
    });
  });

  describe("verifyCurrency", () => {
    it("should validate currency strings", () => {
      expect(verifyCurrency("$100.00")).toBe(true); // Valid currency with decimal
      expect(verifyCurrency("$1,000.00")).toBe(true); // Valid currency with comma
      expect(verifyCurrency("$0.00")).toBe(true); // Zero amount
      expect(verifyCurrency("$1234.56")).toBe(true); // No thousands separator
    });

    it("should reject invalid currency strings", () => {
      expect(verifyCurrency("$100")).toBe(false); // Missing decimal portion
      expect(verifyCurrency("100.00")).toBe(false); // Missing $ sign
      expect(verifyCurrency("not money")).toBe(false); // Not currency format
      expect(verifyCurrency("")).toBe(false); // Empty string
    });
  });
});
