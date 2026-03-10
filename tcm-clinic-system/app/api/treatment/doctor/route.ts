import prisma from "@/lib/prisma";
import { service_status_enum, treatment_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const treatmentItems = Array.isArray(body.treatmentItems)
      ? (body.treatmentItems as Array<{ serviceId: number; roomId: number }>)
      : [];

    if (treatmentItems.length > 0) {
      const {
        doctorId,
        patientId,
        healthProfileId,
        invoiceId,
        startAt,
        treatmentStatus,
      } = body as {
        doctorId?: number;
        patientId?: number;
        healthProfileId?: number;
        invoiceId?: number;
        startAt?: string;
        treatmentStatus?: treatment_status_enum;
      };

      if (
        !doctorId ||
        !patientId ||
        !healthProfileId ||
        !invoiceId ||
        !startAt
      ) {
        return NextResponse.json(
          {
            message:
              "doctorId, patientId, startAt, healthProfile, invoice, and treatmentItems are required",
          },
          { status: 400 },
        );
      }

      const serviceIds = treatmentItems.map((item) => item.serviceId);
      const roomIds = treatmentItems.map((item) => item.roomId);

      const [doctor, patient, healthProfile, invoice, services, rooms] =
        await Promise.all([
          prisma.staff.findUnique({ where: { id: doctorId } }),
          prisma.patient.findUnique({ where: { id: patientId } }),
          prisma.health_profile.findUnique({ where: { id: healthProfileId } }),
          prisma.invoice.findUnique({ where: { id: invoiceId } }),
          prisma.service.findMany({
            where: {
              id: { in: serviceIds },
              status: service_status_enum.AVAILABLE,
            },
          }),
          prisma.room.findMany({ where: { id: { in: roomIds } } }),
        ]);

      if (!doctor || !patient) {
        return NextResponse.json(
          { message: "Doctor or patient not found" },
          { status: 404 },
        );
      }

      if (!healthProfile) {
        return NextResponse.json(
          { message: "Health Profile not found" },
          { status: 404 },
        );
      }

      if (!invoice) {
        return NextResponse.json(
          { message: "Invoice not found" },
          { status: 404 },
        );
      }

      if (services.length !== new Set(serviceIds).size) {
        return NextResponse.json(
          { message: "One or more services are unavailable" },
          { status: 404 },
        );
      }

      if (rooms.length !== new Set(roomIds).size) {
        return NextResponse.json(
          { message: "One or more rooms not found" },
          { status: 404 },
        );
      }

      const scheduleDate = /^\d{4}-\d{2}-\d{2}T/.test(startAt)
        ? startAt.slice(0, 10)
        : new Date(startAt).toISOString().slice(0, 10);
      const scheduleStart = new Date(`${scheduleDate}T00:00:00`);
      const scheduleEnd = new Date(`${scheduleDate}T23:59:59.999`);
      const schedule = await prisma.work_schedule.findFirst({
        where: {
          staff_id: doctorId,
          is_active: true,
          date: { gte: scheduleStart, lte: scheduleEnd },
        },
      });

      if (!schedule) {
        return NextResponse.json(
          {
            message: "Selected doctor has no active work schedule on this date",
          },
          { status: 400 },
        );
      }

      const serviceDataMap = new Map(
        services.map((service) => [
          service.id,
          { duration: service.duration_minute, price: service.price },
        ]),
      );

      const created = await prisma.$transaction(async (tx) => {
        let currentStart = new Date(startAt);
        const treatments = [];
        let totalAdditionalPrice = 0;

        for (const item of treatmentItems) {
          const serviceData = serviceDataMap.get(item.serviceId);
          const duration = serviceData?.duration || 0;
          const price = serviceData?.price || 0;

          const treatment = await tx.treatment.create({
            data: {
              health_profile_id: healthProfileId,
              doctor_id: doctorId,
              patient_id: patientId,
              service_id: item.serviceId,
              room_id: item.roomId,
              treatment_status:
                treatmentStatus || treatment_status_enum.IN_PROGRESS,
              start_at: currentStart,
              end_at: null,
            },
          });

          await tx.invoice_item.create({
            data: {
              invoice_id: invoiceId,
              treatment_id: treatment.id,
              unit_price: price,
            },
          });

          totalAdditionalPrice += Number(price);
          treatments.push(treatment);
          currentStart = new Date(currentStart.getTime() + duration * 60_000);
        }

        const updatedInvoice = await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            total_amount: {
              increment: totalAdditionalPrice,
            },
          },
        });

        return {
          healthProfile,
          invoice: updatedInvoice,
          treatments,
        };
      });

      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
