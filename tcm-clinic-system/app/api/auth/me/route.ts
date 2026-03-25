import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { decryptData } from "@/lib/encryption";

export async function GET() {
    const session = await getSession();

    if (!session || !session.sub) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const accountId = Number(session.sub);

    try {
        const account = await prisma.account.findUnique({
            where: { id: accountId },
            include: {
                patient: true,
                staff: true,
            },
        });

        if (!account) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        let fullName = "";
        if (account.account_role === "PATIENT" && account.patient) {
            fullName = `${account.patient.first_name} ${account.patient.last_name}`;
        } else if (account.staff) {
            fullName = `${account.staff.first_name} ${account.staff.last_name}`;
        }

        return NextResponse.json({
            id: account.id,
            username: decryptData(account.username),
            email: account.email,
            role: account.account_role,
            fullName: fullName,
        });

    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
