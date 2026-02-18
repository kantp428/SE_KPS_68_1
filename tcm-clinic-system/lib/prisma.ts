// lib/prisma.ts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"; // หรือ path ที่คุณเจนไว้

const prismaClientSingleton = () => {
  // 1. สร้าง Connection Pool ตามมาตรฐาน pg
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // 2. ใช้ Adapter เพื่อให้ Prisma คุยกับ Pool ได้ (ดีสำหรับ Serverless/Neon)
  const adapter = new PrismaPg(pool);

  // 3. สร้าง Client โดยส่ง adapter เข้าไป
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
