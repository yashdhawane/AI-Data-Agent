import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.DATA_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("DATA_ENCRYPTION_KEY is not configured");
  }

  const buffer = Buffer.from(key, "base64");

  if (buffer.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY must decode to 32 bytes");
  }

  return buffer;
}

export function encrypt(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decrypt(payload: string): string {
  const [ivEncoded, authTagEncoded, encryptedEncoded] = payload.split(".");

  if (!ivEncoded || !authTagEncoded || !encryptedEncoded) {
    throw new Error("Invalid encrypted payload");
  }

  const key = getEncryptionKey();

  const iv = Buffer.from(ivEncoded, "base64");
  const authTag = Buffer.from(authTagEncoded, "base64");
  const encrypted = Buffer.from(encryptedEncoded, "base64");

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}