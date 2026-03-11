import prisma from "@/lib/prisma";
import { appointment_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id, 10);
        if (isNaN(id)) {
            return NextResponse.json(
                { message: "Invalid appointment ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !Object.values(appointment_status_enum).includes(status)) {
            return NextResponse.json(
                { message: "Invalid status value" },
                { status: 400 }
            );
        }

        const existingAppointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!existingAppointment) {
            return NextResponse.json(
                { message: "Appointment not found" },
                { status: 404 }
            );
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: status as appointment_status_enum },
        });

        return NextResponse.json(
            {
                message: "Appointment status updated successfully",
                appointment: updatedAppointment,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating appointment status:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
