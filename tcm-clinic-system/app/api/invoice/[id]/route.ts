import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const invoiceId = Number(id);

    if (!Number.isInteger(invoiceId) || invoiceId <= 0) {
      return NextResponse.json(
        { message: "Invalid invoice id" },
        { status: 400 },
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
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
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    const isoString = invoice.created_at.toISOString();
    const [datePart, timePart = "00:00"] = isoString.split("T");
    const [year, month, day] = datePart.split("-");

    return NextResponse.json({
      data: {
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
      },
    });
  } catch (error) {
    console.error("GET Invoice Detail Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
