import prisma from "@/lib/prisma";
import { Prisma, invoice_status_enum } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const status = searchParams.get("status");
    const name = searchParams.get("name");

    const skip = (page - 1) * limit;
    const where: Prisma.invoiceWhereInput = {
      ...(status ? { status: status as invoice_status_enum } : {}),
      ...(name
        ? {
            patient: {
              OR: [
                { first_name: { contains: name, mode: "insensitive" } },
                { last_name: { contains: name, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    };

    const sortDirection = status === "UNPAID" ? "asc" : "desc";

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: sortDirection },
        include: {
          patient: true,
          invoice_item: {
            include: {
              medicine: true,
              treatment: {
                include: {
                  service: true,
                },
              },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const data = invoices.map((invoice) => {
      const isoString = invoice.created_at.toISOString();
      const [datePart, timePart = "00:00"] = isoString.split("T");
      const [year, month, day] = datePart.split("-");

      return {
        id: invoice.id.toString(),
        receiptNumber: `TCM-${invoice.created_at.getFullYear()}${(
          invoice.created_at.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${invoice.id}`,
        patientName:
          `${invoice.patient?.first_name || ""} ${
            invoice.patient?.last_name || ""
          }`.trim() || "-",
        total: Number(invoice.total_amount),
        status: invoice.status,
        date: `${day}/${month}/${year}`,
        time: timePart.substring(0, 5),
        items: invoice.invoice_item.map((item) => ({
          name:
            item.medicine?.name ||
            item.treatment?.service?.name ||
            "รายการทั่วไป",
          qty: item.quantity,
          price: Number(item.unit_price),
        })),
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET Invoice Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string | number;
      status?: invoice_status_enum;
    };

    if (!body.id || !body.status) {
      return NextResponse.json(
        { message: "ต้องระบุ ID และ Status" },
        { status: 400 },
      );
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: Number(body.id) },
      data: { status: body.status },
    });

    return NextResponse.json({
      success: true,
      message: "อัปเดตสถานะสำเร็จ",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("PATCH Invoice Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const medicineItems = Array.isArray(body.medicineItems)
      ? (body.medicineItems as Array<{ medicineId: number; quantity: number }>)
      : [];
    const invoiceId = body.invoiceId as number | undefined;

    if (!invoiceId || medicineItems.length === 0) {
      return NextResponse.json(
        { message: "invoiceId and medicineItems array are required" },
        { status: 400 },
      );
    }

    const medicineIds = medicineItems.map((item) => item.medicineId);
    const [invoice, medicines] = await Promise.all([
      prisma.invoice.findUnique({ where: { id: invoiceId } }),
      prisma.medicine.findMany({
        where: {
          id: { in: medicineIds },
        },
      }),
    ]);

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    if (medicines.length !== new Set(medicineIds).size) {
      return NextResponse.json(
        { message: "One or more medicines are unavailable or not found" },
        { status: 404 },
      );
    }

    const medicinePriceMap = new Map(
      medicines.map((medicine) => [medicine.id, medicine.price]),
    );

    const result = await prisma.$transaction(async (tx) => {
      let additionalTotal = 0;
      const itemsToInsert = [];

      for (const item of medicineItems) {
        const unitPrice = Number(medicinePriceMap.get(item.medicineId) || 0);
        additionalTotal += unitPrice * item.quantity;

        itemsToInsert.push({
          invoice_id: invoiceId,
          medicine_id: item.medicineId,
          quantity: item.quantity,
          unit_price: unitPrice,
        });
      }

      await tx.invoice_item.createMany({
        data: itemsToInsert,
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          total_amount: {
            increment: additionalTotal,
          },
        },
      });

      return {
        invoice: updatedInvoice,
        addedItemsCount: itemsToInsert.length,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST Invoice Item Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
