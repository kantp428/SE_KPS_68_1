import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();

  if (!((username || email) && password)) {
    return NextResponse.json(
      { message: "Email and password required" },
      { status: 400 },
    );
  }

  const account = await prisma.account.findFirst({
    where: {
      OR: [{ email: email || undefined }, { username: username || undefined }],
    },
    include: {
      patient: true,
      staff: true,
    },
  });

  if (!account) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  const isValid = await bcrypt.compare(password, account.password_hash);

  if (!isValid) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  let fullName = "";
  if (account.account_role === "PATIENT" && account.patient) {
    fullName = `${account.patient.first_name} ${account.patient.last_name}`;
  } else if (account.staff) {
    fullName = `${account.staff.first_name} ${account.staff.last_name}`;
  }

  await createSession({
    id: account.id,
    username: account.username,
    role: account.account_role,
  });

  return NextResponse.json({
    id: account.id,
    username: account.username,
    role: account.account_role,
    staffRole: account.staff?.staff_role, // ส่ง Role ของ Staff กลับไปด้วย
    fullName: fullName,
  });
}
