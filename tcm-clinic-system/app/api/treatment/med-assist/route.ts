import prisma from "@/lib/prisma";
import { Prisma, treatment_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";
import { toDate, toHHmm } from "@/app/utils/dateFormat";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const status = searchParams.get("status");
    const name = searchParams.get("name");
    const serviceIdsRaw = searchParams.get("serviceIds");
    const date = searchParams.get("date");
    const serviceIds = (serviceIdsRaw || "")
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isFinite(id));

    const skip = (page - 1) * limit;
    const dateFilter = date
      ? {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59.999`),
        }
      : undefined;

    const where: Prisma.treatmentWhereInput = {
      ...(status ? { treatment_status: status as treatment_status_enum } : {}),
      ...(serviceIds.length > 0 ? { service_id: { in: serviceIds } } : {}),
      ...(dateFilter ? { start_at: dateFilter } : {}),
      ...(name
        ? {
            patient: {
              OR: [
                { first_name: { contains: name, mode: "insensitive" } },
                { last_name: { contains: name, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    };

    const [treatments, total] = await Promise.all([
      prisma.treatment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          start_at: "desc",
        },
        include: {
          patient: true,
          staff: true,
          service: true,
          room: true,
        },
      }),
      prisma.treatment.count({ where }),
    ]);

    const data = treatments.map((item) => {
      const expectedEnd = new Date(
        item.start_at.getTime() + item.service.duration_minute * 60_000,
      );
      const endAtSource = item.end_at ?? expectedEnd;

      return {
        id: item.id,
        healthProfileId: item.health_profile_id,
        patientName: `${item.patient.first_name} ${item.patient.last_name}`,
        doctorName: `${item.staff.first_name} ${item.staff.last_name}`,
        serviceName: item.service.name,
        serviceTime: item.service.duration_minute,
        roomName: item.room.name,
        date: toDate(item.start_at),
        startAt: toHHmm(item.start_at),
        endAt: toHHmm(endAtSource),
        status: item.treatment_status,
      };
    });

    return NextResponse.json({
      data,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      healthProfileId,
      doctorId,
      patientId,
      serviceId,
      roomId,
      treatmentStatus,
      startAt,
      endAt,
    } = body as {
      healthProfileId?: number;
      doctorId?: number;
      patientId?: number;
      serviceId?: number;
      roomId?: number;
      treatmentStatus?: treatment_status_enum;
      startAt?: string;
      endAt?: string | null;
    };

    if (
      !healthProfileId ||
      !doctorId ||
      !patientId ||
      !serviceId ||
      !roomId
    ) {
      return NextResponse.json(
        {
          message:
            "healthProfileId, doctorId, patientId, serviceId, and roomId are required",
        },
        { status: 400 },
      );
    }

    const [healthProfile, doctor, patient, service, room] = await Promise.all([
      prisma.health_profile.findUnique({ where: { id: healthProfileId } }),
      prisma.staff.findUnique({ where: { id: doctorId } }),
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.room.findUnique({ where: { id: roomId } }),
    ]);

    if (!healthProfile || !doctor || !patient || !service || !room) {
      return NextResponse.json(
        { message: "Related resource not found" },
        { status: 404 },
      );
    }

    const created = await prisma.treatment.create({
      data: {
        health_profile_id: healthProfileId,
        doctor_id: doctorId,
        patient_id: patientId,
        service_id: serviceId,
        room_id: roomId,
        treatment_status: treatmentStatus || treatment_status_enum.IN_PROGRESS,
        start_at: startAt ? new Date(startAt) : new Date(),
        end_at: endAt ? new Date(endAt) : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
