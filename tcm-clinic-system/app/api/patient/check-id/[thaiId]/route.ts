import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { encryptData } from "@/lib/encryption";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ thaiId: string }> }
) {
    try {
        const { thaiId } = await params;

        if (!thaiId || thaiId.length !== 13) {
            return NextResponse.json(
                { message: "รหัสบัตรประชาชนไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const encryptedThaiId = encryptData(thaiId);

        const patient = await prisma.patient.findFirst({
            where: {
                OR: [
                    { thai_id: thaiId },
                    { thai_id: encryptedThaiId },
                ],
            },
        });

        if (!patient) {
            return NextResponse.json({
                exists: false,
                hasAccount: false,
                patient: null,
            });
        }

        if (patient.account_id) {
            return NextResponse.json({
                exists: true,
                hasAccount: true,
                patient: null,
            });
        }

        return NextResponse.json({
            exists: true,
            hasAccount: false,
            patient: {
                firstName: patient.first_name,
                lastName: patient.last_name,
                birthdate: patient.birthdate.toISOString().split("T")[0],
                gender: patient.gender,
                phoneNumber: patient.phone_number,
                bloodGroup: patient.blood_group,
                chronicDisease: patient.chronic_disease,
            },
        });
    } catch (error) {
        console.error("Check Thai ID error:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล" },
            { status: 500 }
        );
    }
}
