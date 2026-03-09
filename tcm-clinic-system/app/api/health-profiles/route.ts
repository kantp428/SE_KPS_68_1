import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, weight, height, bp, vitals, symptoms } = body;

    const newHealthProfile = await prisma.health_profile.create({
      data: {
        patient_id: parseInt(patient_id, 10),
        weight,
        height,
        bp,
        vitals,
        symptoms,
      },
    });

    return NextResponse.json(newHealthProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating health profile:", error);
    return NextResponse.json(
      { error: "Failed to create health profile" },
      { status: 500 }
    );
  }
}
