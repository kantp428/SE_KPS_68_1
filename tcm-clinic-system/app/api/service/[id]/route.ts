import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id: Number(id) },
    });

    if (!service) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลบริการที่ระบุ" },
        { status: 404 },
      );
    }

    return NextResponse.json(service);
  } catch {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, price, duration_minute, status } = body;

    const updatedService = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price }),
        ...(duration_minute !== undefined && { duration_minute }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "ไม่พบบริการที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.service.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      message: "ลบข้อมูลบริการเรียบร้อยแล้ว",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { message: "ไม่สามารถลบได้ เนื่องจากบริการนี้ถูกใช้งานในข้อมูลอื่นอยู่" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 },
    );
  }
}
