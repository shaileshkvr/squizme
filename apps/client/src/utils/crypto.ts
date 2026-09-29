// Client-side local encryption for personal Gemini API keys using Web Crypto API (AES-GCM 256-bit)
const SALT = 'squizme-local-device-salt';

async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode((window.location?.host || 'squizme') + SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function saveLocalApiKey(apiKey: string): Promise<void> {
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(apiKey)
  );

  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
  localStorage.setItem('squizme_encrypted_gemini_key', JSON.stringify(payload));
}

export async function getLocalApiKey(): Promise<string | null> {
  const raw = localStorage.getItem('squizme_encrypted_gemini_key');
  if (!raw) return null;
  try {
    const { iv, data } = JSON.parse(raw);
    const key = await getEncryptionKey();
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export function removeLocalApiKey(): void {
  localStorage.removeItem('squizme_encrypted_gemini_key');
}

export function hasLocalApiKey(): boolean {
  return Boolean(localStorage.getItem('squizme_encrypted_gemini_key'));
}
