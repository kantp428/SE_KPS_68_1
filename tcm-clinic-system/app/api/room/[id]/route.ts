import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// [GET ONE]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id: Number(id) },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// [PATCH]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { name, status } = body;
    const { id } = await params;

    const updatedRoom = await prisma.room.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// [DELETE]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    await prisma.room.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
