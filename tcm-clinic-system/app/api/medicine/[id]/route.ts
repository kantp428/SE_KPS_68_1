import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Internal server error";
}

// [GET BY ID] - ดึงข้อมูลยาตัวเดียว
export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const medicineId = Number(id);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.json({ message: "Invalid medicine id" }, { status: 400 });
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return NextResponse.json({ message: "ไม่พบข้อมูลยา" }, { status: 404 });
    }

    return NextResponse.json(medicine);
  } catch (error: unknown) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

// [UPDATE] - แก้ไขข้อมูลยา
export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const medicineId = Number(id);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.json(
        { message: "Invalid medicine id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, description, price, status } = body;

    const updatedMedicine = await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        name,
        description,
        price: price !== undefined ? new Prisma.Decimal(price) : undefined,
        status,
      },
    });

    return NextResponse.json(updatedMedicine);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ message: "ไม่พบข้อมูลยาที่ต้องการแก้ไข" }, { status: 404 });
    }

    return NextResponse.json({ message: "แก้ไขข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}

// [DELETE] - ลบข้อมูลยา
export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const medicineId = Number(id);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.json(
        { message: "Invalid medicine id" },
        { status: 400 }
      );
    }

    await prisma.medicine.delete({
      where: { id: medicineId },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ message: "ไม่พบข้อมูลยาที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
