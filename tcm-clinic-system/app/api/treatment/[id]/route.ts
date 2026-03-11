import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { toDate, toHHmm } from "@/app/utils/dateFormat";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const treatment = await prisma.treatment.findUnique({
      where: { id },
      include: {
        patient: true,
        staff: true,
        service: true,
        room: true,
        health_profile: true,
        invoice_item: {
          include: { invoice: true },
        },
      },
    });

    if (!treatment) {
      return NextResponse.json(
        { message: "Treatment not found" },
        { status: 404 },
      );
    }

    const duration = treatment.service?.duration_minute ?? 0;
    const expectedEnd = new Date(
      treatment.start_at.getTime() + duration * 60_000,
    );
    const endAtSource = treatment.end_at ?? expectedEnd;

    // ดึง invoiceId จาก invoice_item แรกที่มี
    const invoiceId = treatment.invoice_item?.[0]?.invoice_id ?? null;

    return NextResponse.json({
      id: treatment.id,
      healthProfileId: treatment.health_profile_id,
      patientId: treatment.patient_id,
      doctorId: treatment.doctor_id,
      invoiceId,
      patientName: treatment.patient
        ? `${treatment.patient.first_name} ${treatment.patient.last_name}`
        : "Unknown",
      doctorName: treatment.staff
        ? `${treatment.staff.first_name} ${treatment.staff.last_name}`
        : "N/A",
      serviceName: treatment.service?.name ?? "No Service",
      roomName: treatment.room?.name ?? "No Room",
      date: toDate(treatment.start_at),
      startAt: toHHmm(treatment.start_at),
      endAt: toHHmm(endAtSource),
      status: treatment.treatment_status,
    });
  } catch (error) {
    console.error("GET Treatment by ID Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 },
    );
  }
}
