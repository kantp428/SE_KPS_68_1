import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// [GET ONE]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
    });

    if (!room) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลห้องที่ระบุ" },
        { status: 404 },
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}

// [PATCH]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, status } = body;

    const updatedRoom = await prisma.room.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "ไม่พบห้องที่ต้องการแก้ไข" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 },
    );
  }
}

// [DELETE]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.room.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "ลบข้อมูลห้องเรียบร้อยแล้ว" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        { message: "ไม่สามารถลบได้ เนื่องจากห้องนี้ถูกใช้งานในข้อมูลอื่นอยู่" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบข้อมูล" },
      { status: 500 },
    );
  }
}
