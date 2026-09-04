import { describe, it, expect } from "vitest";
import { generatePassword, generatePassphrase, calculateEntropy, getStrengthLabel, DEFAULT_OPTIONS } from "../src/passwordGenerator";

describe("generatePassword", () => {
  it("should generate a password of specified length", () => {
    const pwd = generatePassword({ ...DEFAULT_OPTIONS, length: 24 });
    expect(pwd).toHaveLength(24);
  });

  it("should only use selected character sets", () => {
    const pwd = generatePassword({ ...DEFAULT_OPTIONS, length: 100, lowercase: true, uppercase: false, numbers: false, symbols: false, excludeAmbiguous: false });
    expect(pwd).toMatch(/^[a-z]+$/);
  });

  it("should exclude ambiguous characters when enabled", () => {
    const pwd = generatePassword({ ...DEFAULT_OPTIONS, length: 200, lowercase: true, uppercase: true, numbers: true, symbols: false, excludeAmbiguous: true });
    expect(pwd).not.toMatch(/[il1Lo0O]/);
  });

  it("should generate different passwords each time", () => {
    const pwd1 = generatePassword(DEFAULT_OPTIONS);
    const pwd2 = generatePassword(DEFAULT_OPTIONS);
    expect(pwd1).not.toBe(pwd2);
  });

  it("should return empty string if no character sets selected", () => {
    const pwd = generatePassword({ ...DEFAULT_OPTIONS, lowercase: false, uppercase: false, numbers: false, symbols: false });
    expect(pwd).toBe("");
  });
});

describe("generatePassphrase", () => {
  it("should generate a passphrase with correct word count", () => {
    const pp = generatePassphrase(5, "-");
    expect(pp.split("-")).toHaveLength(5);
  });

  it("should capitalize words when enabled", () => {
    const pp = generatePassphrase(4, "-", true);
    pp.split("-").forEach((word) => {
      expect(word[0]).toMatch(/[A-Z]/);
    });
  });

  it("should use custom separator", () => {
    const pp = generatePassphrase(3, "_");
    expect(pp).toContain("_");
  });
});

describe("calculateEntropy", () => {
  it("should calculate entropy for lowercase only", () => {
    const entropy = calculateEntropy("abcdefghij");
    expect(entropy).toBe(Math.round(10 * Math.log2(26)));
  });

  it("should calculate entropy for mixed characters", () => {
    const entropy = calculateEntropy("Abc123!@#");
    expect(entropy).toBeGreaterThan(0);
  });

  it("should return 0 for empty string", () => {
    expect(calculateEntropy("")).toBe(0);
  });
});

describe("getStrengthLabel", () => {
  it("should return Very Weak for low entropy", () => {
    const result = getStrengthLabel(20);
    expect(result.label).toBe("Very Weak");
  });

  it("should return Very Strong for high entropy", () => {
    const result = getStrengthLabel(150);
    expect(result.label).toBe("Very Strong");
  });

  it("should return a percentage", () => {
    const result = getStrengthLabel(60);
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });
});
