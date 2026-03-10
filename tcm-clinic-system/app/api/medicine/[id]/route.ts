import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// [GET BY ID] - ดึงข้อมูลยาตัวเดียว
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const medicine = await (prisma as any).medicine.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!medicine) {
      return NextResponse.json({ message: "ไม่พบข้อมูลยา" }, { status: 404 });
    }

    return NextResponse.json(medicine);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// [UPDATE] - แก้ไขข้อมูลยา
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, price, status } = body;

    const updatedMedicine = await (prisma as any).medicine.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        description,
        price: price !== undefined ? new Prisma.Decimal(price) : undefined,
        status,
      },
    });

    return NextResponse.json(updatedMedicine);
  } catch (error: any) {
    return NextResponse.json({ message: "แก้ไขข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}

// [DELETE] - ลบข้อมูลยา
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await (prisma as any).medicine.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ message: "ลบข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}