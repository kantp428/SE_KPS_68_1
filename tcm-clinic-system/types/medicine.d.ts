// types/medicine.ts

export type MedicineStatus = "AVAILABLE" | "UNAVAILABLE"; // ถ้ามีสถานะอื่นๆ เพิ่มเติม ให้เพิ่มตรงนี้

export interface Medicine {
  id: number;
  name: string;
  description: string | null;
  price: number;
  status: MedicineStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// สำหรับ Form ที่ใช้ React Hook Form และ Zod
export interface MedicineFormValues {
  name: string;
  description?: string | null;
  price: number;
  status: string;
}