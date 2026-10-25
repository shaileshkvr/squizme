import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../../src/modules/auth/password.js";

describe("Password Hashing & Verification (scrypt)", () => {
  it("hashes password and verifies successfully with correct password", async () => {
    const password = "ValidP@ssword123!";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("rejects wrong password against hash", async () => {
    const password = "ValidP@ssword123!";
    const hash = await hashPassword(password);

    const isWrong = await verifyPassword("WrongP@ssword123!", hash);
    expect(isWrong).toBe(false);
  });

  it("handles malformed hashes safely without throwing", async () => {
    expect(await verifyPassword("password", "invalid")).toBe(false);
    expect(await verifyPassword("password", "sha256:salt:hash")).toBe(false);
    expect(await verifyPassword("password", "scrypt:invalidhex:invalidhex")).toBe(false);
  });
});
