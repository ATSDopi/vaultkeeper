const PBKDF2_ITERATIONS = 600000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function generateSalt(): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return bufferToBase64(salt);
}

export async function deriveKey(
  password: string,
  saltBase64: string
): Promise<CryptoKey> {
  const passwordBytes = encoder.encode(password);
  const salt = base64ToBuffer(saltBase64);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(
  key: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = encoder.encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(iv),
  };
}

export async function decrypt(
  key: CryptoKey,
  ciphertextBase64: string,
  ivBase64: string
): Promise<string> {
  const ciphertext = base64ToBuffer(ciphertextBase64);
  const iv = base64ToBuffer(ivBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}

export async function createVerifier(
  key: CryptoKey
): Promise<{ verifier: string; iv: string }> {
  const challenge = "vaultkeeper-verification-token";
  return encrypt(key, challenge);
}

export async function verifyKey(
  key: CryptoKey,
  verifier: string,
  iv: string
): Promise<boolean> {
  try {
    const decrypted = await decrypt(key, verifier, iv);
    return decrypted === "vaultkeeper-verification-token";
  } catch {
    return false;
  }
}

export async function encryptEntry(
  key: CryptoKey,
  entry: { id: string; data: string }
): Promise<{ id: string; iv: string; ciphertext: string }> {
  const { ciphertext, iv } = await encrypt(key, entry.data);
  return { id: entry.id, iv, ciphertext };
}

export async function decryptEntry(
  key: CryptoKey,
  encrypted: { id: string; iv: string; ciphertext: string }
): Promise<{ id: string; data: string }> {
  const data = await decrypt(key, encrypted.ciphertext, encrypted.iv);
  return { id: encrypted.id, data };
}

export function generateId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateDeviceId(): string {
  return generateId();
}

export { PBKDF2_ITERATIONS };
