import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// [GET ALL]
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;
    const where: Prisma.staffWhereInput = {};

    if (search) {
      where.OR = [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [staffList, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
      }),
      prisma.staff.count({ where }),
    ]);

    return NextResponse.json({
      data: staffList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// [CREATE]
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { first_name, last_name, gender, phone_number, staff_role, account_id } = data;

    // ตรวจสอบข้อมูลเบื้องต้น (สามารถปรับปรุงตามความเหมาะสม)
    if (!first_name || !last_name || !staff_role) {
      return NextResponse.json(
        { message: "กรุณากรอกชื่อ นามสกุล และตำแหน่ง" },
        { status: 400 },
      );
    }

    const newStaff = await prisma.staff.create({
      data: {
        first_name,
        last_name,
        gender,
        phone_number,
        staff_role,
        account_id,
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการสร้างข้อมูลพนักงาน" },
      { status: 500 },
    );
  }
}
