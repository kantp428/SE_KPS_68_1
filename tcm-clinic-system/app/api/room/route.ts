import prisma from "@/lib/prisma";
import { Prisma, room_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

// [GET ALL]
export async function GET(req: Request) {
  try {
    // Query Parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const name = searchParams.get("name");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;
    const validStatuses = ["AVAILABLE", "UNAVAILABLE"];
    const where: Prisma.roomWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (status && validStatuses.includes(status)) {
      where.status = status as room_status_enum;
    }

    // Data และ Total Count
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where: where,
        skip: skip,
        take: limit,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.room.count({
        where: where,
      }),
    ]);

    // คำนวณข้อมูลสำหรับการทำ UI Pagination
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: rooms,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// [CREATE]
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, status } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 },
      );
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        status: status || "AVAILABLE",
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
