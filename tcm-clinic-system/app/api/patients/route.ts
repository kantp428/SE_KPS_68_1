import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { first_name: { contains: search, mode: "insensitive" as const } },
            { last_name: { contains: search, mode: "insensitive" as const } },
            { thai_id: { contains: search } },
          ],
        }
      : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: whereClause,
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      thai_id,
      birthdate,
      gender,
      phone_number,
    } = body;

    const newPatient = await prisma.patient.create({
      data: {
        first_name,
        last_name,
        thai_id,
        birthdate: new Date(birthdate),
        gender,
        phone_number,
        blood_group: "O", // Default fallback since it's required by schema
      },
    });

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}
