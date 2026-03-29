import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date"); // yyyy-mm-dd

    if (!dateStr) {
        return NextResponse.json({ message: "Date is required" }, { status: 400 });
    }

    try {
        const targetDate = new Date(dateStr);
        if (isNaN(targetDate.getTime())) {
            return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
        }

        // 1. นับจำนวนห้องตรวจทั้งหมด
        const totalRooms = await prisma.room.count({
            where: { status: "AVAILABLE" }
        });

        if (totalRooms === 0) {
            return NextResponse.json({ date: dateStr, slots: [] }, { status: 200 });
        }

        // 2. ดึงตารางงานของแพทย์ในวันนั้น
        const doctorSchedules = await prisma.work_schedule.findMany({
            where: {
                date: targetDate,
                is_active: true,
                staff: {
                    staff_role: "DOCTOR"
                }
            }
        });

        // กำหนดช่วงเวลาที่คลินิกเปิดทำการ แบบรายชั่วโมง (เช่น 09:00 - 17:00)
        // สร้าง Slot ตั้งแต่ 09 ถึง 16 (นั่นคือสล็อตสุดท้าย 16:00 - 17:00)
        const workingHours = [9, 10, 11, 12, 13, 14, 15, 16];
        const slots = [];

        for (const hour of workingHours) {
            const slotHourStr = hour.toString().padStart(2, "0");
            const timeStr = `${slotHourStr}:00`;

            // สร้าง Date object สำหรับเวลานั้นๆ
            // ใช้ UTC หรือปรับตาม Timezone ที่เหมาะสม
            // เพื่อความง่ายตอน query appointment เราจะสร้าง DateTime แบบ Local (หรือตามที่โปรเจกต์ใช้)
            const slotDateTimePattern = `${dateStr}T${slotHourStr}:00:00.000Z`; // ระวังเรื่อง Timezone
            // ในที่นี้สมมติให้รับ Timezone GMT เข้าระบบเลย หรือจัดการแบบง่ายๆ ก่อน
            const slotDateTime = new Date(`${dateStr}T${slotHourStr}:00:00.000+07:00`);

            // ตรวจสอบเงื่อนไขที่ 1: ตารางเวลาของหมอ (นับจำนวนหมอที่ว่างในชั่วโมงนั้น)
            let availableDoctorsCount = 0;
            for (const schedule of doctorSchedules) {
                // Prisma จะดึง db.Time เป็น Date ให้ (1970-01-01T...)
                // เราสนใจแค่ชั่วโมงและนาที
                const startHour = schedule.starttime.getUTCHours();
                const startMinute = schedule.starttime.getUTCMinutes();
                const endHour = schedule.endtime.getUTCHours();
                const endMinute = schedule.endtime.getUTCMinutes();

                const scheduleStartVal = startHour + startMinute / 60;
                const scheduleEndVal = endHour + endMinute / 60;
                const slotStartVal = hour;
                const slotEndVal = hour + 1; // 1 duration hour

                if (scheduleStartVal <= slotStartVal && scheduleEndVal >= slotEndVal) {
                    availableDoctorsCount++;
                }
            }

            if (availableDoctorsCount === 0) {
                slots.push({
                    time: timeStr,
                    isAvailable: false,
                    reason: "ไม่มีแพทย์ออกตรวจในเวลานี้"
                });
                continue; // ข้ามไปเช็คเวลาถัดไป
            }

            // ตรวจสอบเงื่อนไขที่ 2: เช็คคิวกับความจุสูงสุดที่รับได้ (min(ห้อง, หมอ))
            const maxAppointmentsCapacity = Math.min(totalRooms, availableDoctorsCount);

            // นับ appointment ใน slots นี้
            const appointmentsAtSlot = await prisma.appointment.count({
                where: {
                    datetime: slotDateTime,
                    status: {
                        not: "CANCELLED"
                    }
                }
            });

            if (appointmentsAtSlot >= maxAppointmentsCapacity) {
                slots.push({
                    time: timeStr,
                    isAvailable: false,
                    reason: "คิวเต็มแล้ว (แพทย์หรือห้องไม่ว่าง)"
                });
            } else {
                slots.push({
                    time: timeStr,
                    isAvailable: true,
                });
            }
        }

        return NextResponse.json({
            date: dateStr,
            slots: slots
        });

    } catch (error) {
        console.error("Error fetching slots:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
