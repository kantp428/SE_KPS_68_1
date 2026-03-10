// types/medicine.ts

export type MedicineStatus = "AVAILABLE" | "UNAVAILABLE"; // ถ้ามีสถานะอื่นๆ เพิ่มเติม ให้เพิ่มตรงนี้

export interface Medicine {
  id: number;
  name: string;
  description: string | null; // คำอธิบายสามารถเป็น null ได้
  price: number | Prisma.Decimal; // สามารถเป็น number หรือ Prisma.Decimal ได้
  status: MedicineStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// สำหรับ Form ที่ใช้ React Hook Form และ Zod
export interface MedicineFormValues {
  name: string;
  description?: string | null;
  price: number;
  status: string; // ใช้ string ชั่วคราวเพื่อให้ React Hook Form ทำงานง่ายขึ้น
}