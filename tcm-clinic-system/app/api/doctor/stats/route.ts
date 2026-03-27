import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized: No session found" }, { status: 401 });
    }

    const accountId = Number(session.sub);

    try {
        const staff = await prisma.staff.findUnique({
            where: { account_id: accountId },
        });

        if (!staff) {
            return NextResponse.json({ message: "Staff record not found for this account" }, { status: 404 });
        }

        // Date boundaries for "Today"
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [appointmentCount, inProgressCount, completedTodayCount] = await Promise.all([
            // 1. Confirmed appointments today (clinic-wide)
            prisma.appointment.count({
                where: {
                    datetime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: "CONFIRMED",
                },
            }),
            // 2. In-progress treatments for THIS doctor
            prisma.treatment.count({
                where: {
                    doctor_id: staff.id,
                    treatment_status: "IN_PROGRESS",
                },
            }),
            // 3. Completed treatments for THIS doctor today
            prisma.treatment.count({
                where: {
                    doctor_id: staff.id,
                    treatment_status: "COMPLETED",
                    end_at: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
            }),
        ]);

        return NextResponse.json({
            appointmentCount,
            inProgressCount,
            completedTodayCount,
        });

    } catch (error) {
        console.error("Error fetching doctor stats:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
