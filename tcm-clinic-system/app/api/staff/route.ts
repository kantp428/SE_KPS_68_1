import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const whereClause: any = search
      ? {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { 
               account: {
                   username: { contains: search, mode: "insensitive"}
               }
            }
          ],
        }
      : {};

    const [staffList, total] = await Promise.all([
      prisma.staff.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
          account: {
            select: { username: true, email: true }
          }
        }
      }),
      prisma.staff.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: staffList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { username, email, password, first_name, last_name, gender, phone_number, staff_role } = data;

    if (!username || !email || !password || !first_name || !last_name || !gender || !phone_number || !staff_role) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Hash the password securely
    const password_hash = await bcrypt.hash(password, 10);

    // Use a transaction to ensure both account and staff are created successfully together
    const newStaff = await prisma.$transaction(async (tx) => {
      // 1. Create the account first
      const account = await tx.account.create({
        data: {
          username,
          email,
          password_hash,
          account_role: "STAFF",
        },
      });

      // 2. Create the staff using the new account's ID
      const staff = await tx.staff.create({
        data: {
          first_name,
          last_name,
          gender,
          phone_number,
          staff_role,
          account_id: account.id,
        },
      });

      return staff;
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error: any) {
    console.error("Error creating staff:", error);
    if (error.code === 'P2002') {
       return NextResponse.json(
        { message: "Username หรือ Email นี้ถูกใช้งานไปแล้ว" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create staff" },
      { status: 500 }
    );
  }
}
