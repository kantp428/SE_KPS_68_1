import prisma from "@/lib/prisma";
import { appointment_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const patientId = parseInt(params.id, 10);

    if (!Number.isFinite(patientId)) {
      return NextResponse.json(
        { message: "Invalid patient id" },
        { status: 400 },
      );
    }

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

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointment: {
          where: {
            status: appointment_status_enum.CONFIRMED,
            datetime: { gte: dayStart, lte: dayEnd },
          },
          orderBy: { datetime: "asc" },
          take: 1,
        },
        health_profile: {
          orderBy: { date_time: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: patient.id,
        fullName: `${patient.first_name} ${patient.last_name}`,
        thaiId: patient.thai_id,
        phoneNumber: patient.phone_number,
        birthdate: patient.birthdate,
        gender: patient.gender,
        bloodGroup: patient.blood_group,
        chronicDisease: patient.chronic_disease,
        bookingAt: patient.appointment[0]?.datetime ?? null,
        latestHealthProfile: patient.health_profile[0] ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
