import prisma from "@/lib/prisma";
import { Prisma, medicine_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

function isMedicineStatus(value: string): value is medicine_status_enum {
  return value === "AVAILABLE" || value === "UNAVAILABLE";
}

// [GET ALL] - ดึงข้อมูลยาพร้อมระบบ Search และ Pagination
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const name = searchParams.get("name");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;
    const where: Prisma.medicineWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    if (status && isMedicineStatus(status)) {
      where.status = status;
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.medicine.count({ where }),
    ]);

    return NextResponse.json({
      data: medicines,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// [CREATE] - เพิ่มข้อมูลยาใหม่
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, status } = body;

    // Validation ขั้นพื้นฐาน
    if (!name || price === undefined) {
      return NextResponse.json(
        { message: "กรุณาระบุชื่อยาและราคา" },
        { status: 400 }
      );
    }

    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        description: description || null,
        // แปลงเป็น Decimal เพื่อรองรับ numeric(10,2) ในฐานข้อมูล
        price: new Prisma.Decimal(price),
        status: isMedicineStatus(status) ? status : medicine_status_enum.AVAILABLE,
      },
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error) {
    console.error("POST API Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}
