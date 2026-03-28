import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { encryptData } from "@/lib/encryption";

type TransactionClient = Omit<
    typeof prisma,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email,
            password,
            firstName,
            lastName,
            thaiId,
            birthdate,
            gender,
            phoneNumber,
            bloodGroup,
            chronicDisease,
        } = body;

        // 1. Basic validation
        if (!email || !password || !firstName || !lastName || !thaiId || !birthdate || !gender || !phoneNumber || !bloodGroup) {
            return NextResponse.json(
                { message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" },
                { status: 400 }
            );
        }

        // 2. Check if username (thaiId) or email already exists
        const encryptedThaiId = encryptData(thaiId);
        const existingAccount = await prisma.account.findFirst({
            where: {
                OR: [{ username: encryptedThaiId }, { email }],
            },
        });

        if (existingAccount) {
            if (existingAccount.username === encryptedThaiId) {
                return NextResponse.json({ message: "ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว" }, { status: 400 });
            }
            return NextResponse.json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" }, { status: 400 });
        }

        const existingPatient = await prisma.patient.findUnique({
            where: { thai_id: encryptedThaiId },
        });

        if (existingPatient && existingPatient.account_id) {
            return NextResponse.json({ message: "รหัสบัตรประชาชนนี้ถูกลงทะเบียนแล้ว" }, { status: 400 });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create Account and Patient in a transaction
        const result = await prisma.$transaction(
            async (tx: TransactionClient) => {
            // Create account
            const newAccount = await tx.account.create({
                data: {
                    username: encryptedThaiId,
                    email,
                    password_hash: hashedPassword,
                    account_role: "PATIENT",
                },
            });

            // Create or Update patient
            let updatedOrNewPatient;
            if (existingPatient) {
                updatedOrNewPatient = await tx.patient.update({
                    where: { id: existingPatient.id },
                    data: {
                        account_id: newAccount.id,
                    },
                });
            } else {
                updatedOrNewPatient = await tx.patient.create({
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        thai_id: encryptedThaiId,
                        birthdate: new Date(birthdate),
                        gender: gender as "MALE" | "FEMALE",
                        phone_number: phoneNumber,
                        blood_group: bloodGroup as "A" | "B" | "AB" | "O",
                        chronic_disease: chronicDisease || null,
                        account_id: newAccount.id,
                    },
                });
            }

                return { account: newAccount, patient: updatedOrNewPatient };
            },
        );

        return NextResponse.json(
            { message: "ลงทะเบียนสำเร็จ", data: { id: result.account.id, username: result.account.username } },
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการลงทะเบียน โปรดลองใหม่อีกครั้ง" },
            { status: 500 }
        );
    }
}
