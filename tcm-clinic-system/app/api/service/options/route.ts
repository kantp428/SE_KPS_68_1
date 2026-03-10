import prisma from "@/lib/prisma";
import { Prisma, record_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
    );
    const skip = (page - 1) * limit;

    const where: Prisma.serviceWhereInput = {
      status: record_status_enum.ACTIVE,
    };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const services = await prisma.service.findMany({
      where,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: limit,
    });

    const options = services.map((service) => ({
      value: service.id,
      label: service.name,
    }));

    return NextResponse.json({ data: options });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
