import crypto from "crypto";

// ในการใช้งานจริง ควรเก็บค่าเหล่านี้ไว้ในไฟล์ .env และห้ามเปิดเผย!
// ENCRYPTION_KEY ต้องมีขนาด 32 bytes และ IV ต้องมีขนาด 16 bytes
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY?.trim() || "";
const IV = process.env.ENCRYPTION_IV?.trim() || "";
const ALGORITHM = "aes-256-cbc";

if (!ENCRYPTION_KEY || !IV) {
    throw new Error("Missing ENCRYPTION_KEY or ENCRYPTION_IV in environment variables");
}

if (Buffer.from(ENCRYPTION_KEY).length !== 32) {
    console.warn("ENCRYPTION_KEY must be exactly 32 bytes. Current length:", Buffer.from(ENCRYPTION_KEY).length);
}
if (Buffer.from(IV).length !== 16) {
    console.warn("ENCRYPTION_IV must be exactly 16 bytes. Current length:", Buffer.from(IV).length);
}
/**
 * เข้ารหัสข้อมูล (Encrypt) ให้กลายเป็นข้อความที่อ่านไม่ออก
 */
export function encryptData(text: string): string {
  if (!text) return text;
  try {
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(IV),
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (e) {
    console.error("Encryption error", e);
    return text;
  }
}

/**
 * ถอดรหัสข้อมูล (Decrypt) คืนกลับเป็นข้อความเดิม
 */
export function decryptData(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  // ตรวจสอบเบื้องต้นว่าเป็น Hex String หรือไม่ ถ้าไม่ใช่แปลว่าอาจจะไม่ใช่ข้อความที่เข้ารหัสไว้
  if (!/^[0-9a-fA-F]+$/.test(encryptedText)) return encryptedText;

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(IV),
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    // กรณีถอดรหัสไม่สำเร็จ (เช่น ข้อมูลเดิมเป็น Plain text อยู่แล้ว) ให้คืนค่าเดิมกลับไป
    return encryptedText;
  }
}
