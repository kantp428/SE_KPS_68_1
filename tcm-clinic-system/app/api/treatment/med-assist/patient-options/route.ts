import prisma from "@/lib/prisma";
import { appointment_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";
import { decryptData } from "@/lib/encryption";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
    );

    const now = new Date();
    const dayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const dayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { first_name: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { thai_id: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
      take: limit,
      include: {
        appointment: {
          where: {
            status: appointment_status_enum.CONFIRMED,
            datetime: { gte: dayStart, lte: dayEnd },
          },
          orderBy: { datetime: "asc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      data: patients.map((p) => ({
        value: p.id,
        label: `${p.first_name} ${p.last_name}`,
        thaiId: decryptData(p.thai_id),
        bookingAt: p.appointment[0]?.datetime ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
