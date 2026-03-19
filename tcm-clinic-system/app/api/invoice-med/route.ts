import prisma from "@/lib/prisma";
import { medicine_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

type MedicineItemInput = {
  medId: number;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, items } = body as {
      invoiceId?: number;
      items?: MedicineItemInput[];
    };

    if (!invoiceId || !items || items.length === 0) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 },
      );
    }

    const mergedItems = new Map<number, number>();
    for (const item of items) {
      if (!item?.medId || !item?.quantity) continue;
      mergedItems.set(item.medId, (mergedItems.get(item.medId) ?? 0) + item.quantity);
    }

    const normalizedItems = Array.from(mergedItems.entries()).map(
      ([medId, quantity]) => ({
        medId,
        quantity,
      }),
    );

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 },
      );
    }

    const medicineIds = normalizedItems.map((item) => item.medId);
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });

    let totalToAdd = 0;

    const invoiceItemsData = normalizedItems.map((item) => {
      const medicine = medicines.find((med) => med.id === item.medId);
      const unitPrice = medicine ? Number(medicine.price) : 0;

      totalToAdd += unitPrice * item.quantity;

      return {
        invoice_id: invoiceId,
        medicine_id: item.medId,
        quantity: item.quantity,
        unit_price: unitPrice,
      };
    });

    await prisma.$transaction(async (tx) => {
      const existingItems = await tx.invoice_item.findMany({
        where: {
          invoice_id: invoiceId,
          medicine_id: { in: medicineIds },
          treatment_id: null,
        },
      });

      for (const item of invoiceItemsData) {
        const existing = existingItems.find(
          (invoiceItem) => invoiceItem.medicine_id === item.medicine_id,
        );

        if (existing) {
          await tx.invoice_item.update({
            where: { id: existing.id },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
          continue;
        }

        await tx.invoice_item.create({
          data: item,
        });
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          total_amount: {
            increment: totalToAdd,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "บันทึกและอัปเดตยอดเงินสำเร็จ",
      addedAmount: totalToAdd,
    });
  } catch (error) {
    console.error("Add Medicine Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการบันทึก" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      where: {
        status: medicine_status_enum.AVAILABLE,
      },
      select: { id: true, name: true, price: true },
    });

    return NextResponse.json({ data: medicines });
  } catch (error) {
    console.error("GET Medicine Error:", error);
    return NextResponse.json(
      { message: "ดึงข้อมูลยาไม่สำเร็จ" },
      { status: 500 },
    );
  }
}
