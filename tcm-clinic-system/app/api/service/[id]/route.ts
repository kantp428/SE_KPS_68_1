import prisma from "@/lib/prisma";
import { Prisma, service_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

// [GET ALL]
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const name = searchParams.get("name");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;
    const where: Prisma.serviceWhereInput = {};

    if (name) where.name = { contains: name, mode: "insensitive" };
    if (status) where.status = status as service_status_enum;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json({
      data: services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: String(error) },
      { status: 500 }
    );
  }
}

// [CREATE]
export async function POST(req: Request) {
  try {
    const { name, price, duration_minute, status } = await req.json();

    if (!name || price === undefined || !duration_minute) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const newService = await prisma.service.create({
      data: {
        name,
        price,
        duration_minute,
        status: status || "AVAILABLE",
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: String(error) },
      { status: 500 }
    );
  }
}