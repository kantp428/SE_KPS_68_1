import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
    // const session = await getSession();

    // if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    //     return NextResponse.json({
    //         message: "Unauthorized",
    //         sessionRole: session?.role
    //     }, { status: 401 });
    // }


    try {
        // Date boundaries for "Today"
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [appointmentCount, inProgressCount, unpaidInvoiceCount] = await Promise.all([
            // 1. Confirmed appointments today
            prisma.appointment.count({
                where: {
                    datetime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: "CONFIRMED",
                },
            }),
            // 2. In-progress treatments (Clinic-wide for MA)
            prisma.treatment.count({
                where: {
                    treatment_status: "IN_PROGRESS",
                },
            }),
            // 3. Unpaid invoices
            prisma.invoice.count({
                where: {
                    status: "UNPAID",
                },
            }),
        ]);

        return NextResponse.json({
            appointmentCount,
            inProgressCount,
            unpaidInvoiceCount,
        });

    } catch (error) {
        console.error("Error fetching med-assist stats:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
