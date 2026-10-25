import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 3) {
    return false;
  }
  const [algorithm, salt, hash] = parts;
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  try {
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    const keyBuffer = Buffer.from(hash, "hex");
    if (derivedKey.length !== keyBuffer.length) {
      return false;
    }
    return timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}
