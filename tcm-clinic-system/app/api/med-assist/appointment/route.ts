import { toDate, toHHmm } from "@/app/utils/dateFormat";
import prisma from "@/lib/prisma";
import { Prisma, appointment_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
        const status = searchParams.get("status");
        const name = searchParams.get("name");
        const date = searchParams.get("date");

        const skip = (page - 1) * limit;

        const dateFilter = date
            ? {
                gte: new Date(`${date}T00:00:00`),
                lte: new Date(`${date}T23:59:59.999`),
            }
            : undefined;

        const where: Prisma.appointmentWhereInput = {
            ...(status ? { status: status as appointment_status_enum } : {}),
            ...(dateFilter ? { datetime: dateFilter } : {}),
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

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    datetime: "desc",
                },
                include: {
                    patient: true,
                },
            }),
            prisma.appointment.count({ where }),
        ]);

        const data = appointments.map((item) => {
            return {
                id: item.id,
                patientId: item.patient_id,
                patientName: `${item.patient.first_name} ${item.patient.last_name}`,
                patientPhone: item.patient.phone_number,
                datetime: item.datetime.toISOString(),
                date: toDate(item.datetime),
                time: toHHmm(item.datetime),
                status: item.status,
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
        console.error("Error fetching med-assist appointments:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
