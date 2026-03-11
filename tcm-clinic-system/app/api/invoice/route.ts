import prisma from "@/lib/prisma";
import { Prisma, invoice_status_enum } from "@prisma/client";
import { formatDate } from "date-fns";
import { NextResponse } from "next/server";
// นำเข้า Date format utility ของคุณ (ถ้ามี)
// import { toDate, toHHmm } from "@/app/utils/dateFormat"; 

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const status = searchParams.get("status");
    const name = searchParams.get("name");

    const skip = (page - 1) * limit;

    // สร้างเงื่อนไขการค้นหา (Where clause)
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

    // คิวรีข้อมูลและนับจำนวนรวมพร้อมกัน
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: sortDirection,
        },
        include: {
          patient: true,
          invoice_item: {
            include: {
              medicine: true,
              treatment: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    // แปลงข้อมูลให้เข้ากับหน้า UI ของคุณ
    const data = invoices.map((item) => {
      const mappedItems = item.invoice_item.map((invItem) => ({
        name: invItem.medicine?.name || invItem.treatment?.name || "รายการทั่วไป",
        qty: invItem.quantity,
        price: Number(invItem.unit_price),
      }));

      const isoString = item.created_at.toISOString();
      const Date = isoString.split('T')[0];

      const [year, month, day] = Date.split('-');

      const formattedDate = `${day}/${month}/${year}`;
      const formattedTime = isoString.split('T')[1].substring(0, 5);
      
      return {
        id: item.id.toString(),
        receiptNumber: `TCM-${item.created_at.getFullYear()}${(item.created_at.getMonth() + 1).toString().padStart(2, '0')}-${item.id}`,
        patientName: `${item.patient?.first_name || ""} ${item.patient?.last_name || ""}`.trim(),
        total: Number(item.total_amount),
        status: item.status,
        date: formattedDate,
        time : formattedTime,
        items: mappedItems,
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
// ----------------------------------------------------------------------
// PATCH: รับคำสั่งจากหน้าเว็บเพื่ออัปเดตสถานะใบเสร็จเป็น "ชำระแล้ว"
// ----------------------------------------------------------------------
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    // เช็คว่าส่งข้อมูลมาครบไหม
    if (!id || !status) {
      return NextResponse.json(
        { message: "ต้องระบุ ID และ Status" },
        { status: 400 }
      );
    }

    // สั่งให้ Prisma อัปเดตสถานะใน Database
    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(id) }, // แปลง ID ที่ส่งมาเป็นตัวเลข
      data: { status: status as invoice_status_enum },
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
      { status: 500 }
    );
  }
}

// ----------------------------------------------------------------------
// 2. POST: เพิ่มรายการยาเข้าไปในใบเสร็จ (ดึงสไตล์การเช็คข้อมูลมาจากโค้ดคุณ)
// ----------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // จัดรูปแบบและตรวจสอบ Array ของ medicineItems เหมือนที่คุณทำกับ treatmentItems
    const medicineItems = Array.isArray(body.medicineItems)
      ? (body.medicineItems as Array<{ medicineId: number; quantity: number }>)
      : [];

    const invoiceId = body.invoiceId as number | undefined;

    // ตรวจสอบความครบถ้วนของข้อมูล
    if (!invoiceId || medicineItems.length === 0) {
      return NextResponse.json(
        { message: "invoiceId and medicineItems array are required" },
        { status: 400 },
      );
    }

    const medicineIds = medicineItems.map((item) => item.medicineId);

    // ใช้ Promise.all ตรวจสอบความถูกต้องของ Invoice และ Medicine พร้อมกัน
    const [invoice, medicines] = await Promise.all([
      prisma.invoice.findUnique({ where: { id: invoiceId } }),
      prisma.medicine.findMany({
        where: {
          id: { in: medicineIds },
          // ถ้าตาราง medicine ของคุณมี status สามารถเช็คเพิ่มได้ เช่น status: record_status_enum.ACTIVE
        },
      }),
    ]);

    // แจ้งเตือนถ้าไม่พบใบเสร็จ
    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 },
      );
    }

    // ตรวจสอบว่ายาที่ส่งมา มีอยู่ในระบบครบทุกตัวหรือไม่ (เช็คความยาว Set แบบที่คุณเขียน)
    if (medicines.length !== new Set(medicineIds).size) {
      return NextResponse.json(
        { message: "One or more medicines are unavailable or not found" },
        { status: 404 },
      );
    }

    // สร้าง Map สำหรับดึงราคายาอย่างรวดเร็ว (แบบเดียวกับ serviceDurationMap ของคุณ)
    const medicinePriceMap = new Map(
      medicines.map((med) => [med.id, med.price]), // สมมติว่าคอลัมน์ชื่อ price
    );

    // เข้าสู่โหมด Transaction เพื่อบันทึกข้อมูลและอัปเดตยอดเงิน
    const result = await prisma.$transaction(async (tx) => {
      let additionalTotal = 0;
      const itemsToInsert = [];

      // วนลูปเพื่อเตรียมข้อมูลและคำนวณยอด
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

      // สร้างรายการย่อยทั้งหมด
      await tx.invoice_item.createMany({
        data: itemsToInsert,
      });

      // อัปเดตยอดรวมในใบเสร็จหลัก
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