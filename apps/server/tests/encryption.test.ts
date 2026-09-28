import { describe, it, expect, beforeAll } from 'vitest';
import { encryptApiKey, decryptApiKey } from '../src/utils/encryption.js';

describe('API Key Encryption', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('encrypts and decrypts a key correctly', () => {
    const rawKey = 'AIzaSyExampleKey123456789';
    const encrypted = encryptApiKey(rawKey);
    expect(encrypted).not.toBe(rawKey);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:encrypted

    const decrypted = decryptApiKey(encrypted);
    expect(decrypted).toBe(rawKey);
  });
});
