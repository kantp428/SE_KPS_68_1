import "server-only";

import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getEncryptionConfig() {
  const key = process.env.ENCRYPTION_KEY?.trim() || "";
  const iv = process.env.ENCRYPTION_IV?.trim() || "";

  if (!key || !iv) {
    throw new Error(
      "Missing ENCRYPTION_KEY or ENCRYPTION_IV in environment variables",
    );
  }

  if (Buffer.from(key).length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 32 bytes. Current length: ${Buffer.from(key).length}`,
    );
  }

  if (Buffer.from(iv).length !== 16) {
    throw new Error(
      `ENCRYPTION_IV must be exactly 16 bytes. Current length: ${Buffer.from(iv).length}`,
    );
  }

  return { key, iv };
}

export function encryptData(text: string): string {
  if (!text) return text;

  try {
    const { key, iv } = getEncryptionConfig();
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(key),
      Buffer.from(iv),
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (error) {
    console.error("Encryption error", error);
    return text;
  }
}

export function decryptData(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  if (!/^[0-9a-fA-F]+$/.test(encryptedText)) return encryptedText;

  try {
    const { key, iv } = getEncryptionConfig();
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(key),
      Buffer.from(iv),
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return encryptedText;
  }
}
