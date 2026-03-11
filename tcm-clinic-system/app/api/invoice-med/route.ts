import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { medicine_status_enum } from "@prisma/client";

// รับข้อมูลเพื่อบันทึกการจ่ายยา และบวกยอดเงินเข้า Invoice
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, items } = body; 
    // items จะมีหน้าตาแบบ [{ medId: 1, quantity: 2 }, ...]

    if (!invoiceId || !items || items.length === 0) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // 1. ดึงข้อมูล "ราคาปัจจุบัน" ของยาที่เลือกมาจาก Database
    const medicineIds = items.map((item: any) => item.medId);
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });

    // 2. สร้างตัวแปรไว้เก็บ "ยอดรวมทั้งหมด" ที่ต้องบวกเพิ่มในบิล
    let totalToAdd = 0;

    // 3. เตรียมข้อมูลเพื่อนำไป Insert ลงตาราง invoice_item
    const invoiceItemsData = items.map((item: any) => {
      // หาราคาของยาตัวนั้นๆ
      const med = medicines.find((m) => m.id === item.medId);
      const unitPrice = med ? Number(med.price) : 0;
      
      // บวกเงินเข้ายอดรวม
      totalToAdd += unitPrice * item.quantity;

      return {
        invoice_id: invoiceId,
        medicine_id: item.medId,
        quantity: item.quantity,
        unit_price: unitPrice, // บันทึกราคา ณ วันที่ซื้อเก็บไว้ด้วย
      };
    });

    // 4. ใช้ Transaction (ทำ 2 อย่างพร้อมกัน ถ้าพังคือยกเลิกหมด ป้องกันเงินหาย)
    const result = await prisma.$transaction([
      // คำสั่งที่ 1: บันทึกรายการย่อยลง invoice_item
      prisma.invoice_item.createMany({
        data: invoiceItemsData,
      }),
      // คำสั่งที่ 2: อัปเดตยอดเงินรวม (total_amount) ในตาราง invoice
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          total_amount: {
            increment: totalToAdd, // <--- ทีเด็ดอยู่ตรงนี้! สั่งให้บวกเพิ่มจากค่าเดิมอัตโนมัติ
          },
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "บันทึกและอัปเดตยอดเงินสำเร็จ",
      addedAmount: totalToAdd 
    });

  } catch (error) {
    console.error("Add Medicine Error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการบันทึก" }, { status: 500 });
  }
}

// แถมฟังก์ชัน GET สำหรับดึงรายชื่อยาไปโชว์ใน Dropdown
// แถมฟังก์ชัน GET สำหรับดึงรายชื่อยาไปโชว์ใน Dropdown
export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      where: { 
        status: medicine_status_enum.AVAILABLE // 🌟 เรียกใช้แบบนี้ ขีดแดงจะหายไปเลย!
      },
      select: { id: true, name: true, price: true }
    });
    return NextResponse.json({ data: medicines });
  } catch (error) {
    console.error("GET Medicine Error:", error);
    return NextResponse.json({ message: "ดึงข้อมูลยาไม่สำเร็จ" }, { status: 500 });
  }
}