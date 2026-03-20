import prisma from "@/lib/prisma";
import { Prisma, staff_role_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page      = parseInt(searchParams.get("page")  || "1");
    const limit     = parseInt(searchParams.get("limit") || "200");
    const staff_id  = searchParams.get("staff_id");
    const role      = searchParams.get("role");
    const date_from = searchParams.get("date_from");
    const date_to   = searchParams.get("date_to");
    const is_active = searchParams.get("is_active");

    const skip  = (page - 1) * limit;
    const where: Prisma.work_scheduleWhereInput = {};

    if (staff_id) where.staff_id = parseInt(staff_id);

    if (role && Object.values(staff_role_enum).includes(role as staff_role_enum)) {
      where.staff = { staff_role: role as staff_role_enum };
    }

    if (date_from || date_to) {
      where.date = {
        ...(date_from ? { gte: new Date(date_from) } : {}),
        ...(date_to   ? { lte: new Date(date_to)   } : {}),
      };
    }

    if (is_active !== null && is_active !== undefined && is_active !== "") {
      where.is_active = is_active === "true";
    }

    const [rows, total] = await Promise.all([
      prisma.work_schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: "asc" }, { starttime: "asc" }],
        include: {
          staff: {
            select: { id: true, first_name: true, last_name: true, staff_role: true },
          },
        },
      }),
      prisma.work_schedule.count({ where }),
    ]);

    // normalize time fields → "HH:mm:ss"
    const data = rows.map((r) => ({
      ...r,
      date:      r.date.toISOString().slice(0, 10),
      starttime: r.starttime.toISOString().slice(11, 19),
      endtime:   r.endtime.toISOString().slice(11, 19),
    }));

    return NextResponse.json({
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/work-schedule]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { staff_id, date, starttime, endtime, is_active } = await req.json();

    if (!staff_id || !date || !starttime || !endtime) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบ (staff_id, date, starttime, endtime)" },
        { status: 400 }
      );
    }

    const row = await prisma.work_schedule.create({
      data: {
        staff_id:  parseInt(staff_id),
        date:      new Date(date),
        starttime: new Date(`1970-01-01T${starttime}Z`),
        endtime:   new Date(`1970-01-01T${endtime}Z`),
        is_active: is_active ?? true,
      },
      include: {
        staff: {
          select: { id: true, first_name: true, last_name: true, staff_role: true },
        },
      },
    });

    const data = {
      ...row,
      date:      row.date.toISOString().slice(0, 10),
      starttime: row.starttime.toISOString().slice(11, 19),
      endtime:   row.endtime.toISOString().slice(11, 19),
    };

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/work-schedule]", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการสร้างข้อมูล" }, { status: 500 });
  }
}