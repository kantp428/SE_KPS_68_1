import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const healthProfile = await prisma.health_profile.findUnique({
      where: { id },
      // include: {
      //   patient: true,
      // },
    });

    if (!healthProfile) {
      return NextResponse.json(
        { message: "Health profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(healthProfile);
  } catch (error) {
    console.error("GET Health Profile Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const existing = await prisma.health_profile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Health profile not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const {
      weight,
      height,
      bp,
      symptoms,
      vitals,
    }: {
      weight?: number;
      height?: number;
      bp?: number;
      symptoms?: string;
      vitals?: Prisma.InputJsonValue;
    } = body;

    const updated = await prisma.health_profile.update({
      where: { id },
      data: {
        ...(weight !== undefined && { weight }),
        ...(height !== undefined && { height }),
        ...(bp !== undefined && { bp }),
        ...(symptoms !== undefined && { symptoms }),
        ...(vitals !== undefined && { vitals }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH Health Profile Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 },
    );
  }
}
