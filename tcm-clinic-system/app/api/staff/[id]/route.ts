import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        account: {
          select: { username: true, email: true },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const data = await req.json();
    const { first_name, last_name, gender, phone_number, staff_role, username, email, password, super_key } = data;

    if (!first_name || !last_name || !staff_role || !gender || !username || !email) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Check if the staff exists to get their account_id
    const existingStaff = await prisma.staff.findUnique({
      where: { id },
      select: { account_id: true }
    });

    if (!existingStaff) {
       return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    // Prepare account data to update
    const accountData: Prisma.accountUpdateInput = {
      username,
      email,
    };

    // If password is provided, validation with SUPER_KEY is required
    if (password) {
      const expectedSuperKey = process.env.SUPER_KEY;
      if (!expectedSuperKey || super_key !== expectedSuperKey) {
        return NextResponse.json(
          { message: "Super Key ไม่ถูกต้อง ไม่สามารถเปลี่ยนรหัสผ่านได้" },
          { status: 401 }
        );
      }
      accountData.password_hash = await bcrypt.hash(password, 10);
    }

    // Perform the update in a transaction
    const updatedStaff = await prisma.$transaction(async (tx) => {
      // 1. Update the account
      await tx.account.update({
        where: { id: existingStaff.account_id },
        data: accountData,
      });

      // 2. Update the staff details
      const staffUpdate = await tx.staff.update({
        where: { id },
        data: {
          first_name,
          last_name,
          gender,
          phone_number,
          staff_role,
        },
      });

      return staffUpdate;
    });

    return NextResponse.json(updatedStaff);
  } catch (error: unknown) {
    console.error("Error updating staff:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
       return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to update staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Staff deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting staff:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
       return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to delete staff" },
      { status: 500 }
    );
  }
}
