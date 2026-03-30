import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { patientId, date, time } = body; // patientId: 1, date: "2026-03-10", time: "09:00"

        if (!patientId || !date || !time) {
            return NextResponse.json({ message: "Patient ID, Date, and Time are required" }, { status: 400 });
        }

        // Validate patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!patient) {
            return NextResponse.json({ message: "Patient not found" }, { status: 404 });
        }

        // แปลงวันที่และเวลาเพื่อตรวจทานจอง
        const targetDate = new Date(date);
        const [hourStr] = time.split(":");
        const hour = parseInt(hourStr, 10);

        if (isNaN(targetDate.getTime()) || isNaN(hour)) {
            return NextResponse.json({ message: "Invalid date or time format" }, { status: 400 });
        }

        const slotDateTime = new Date(`${date}T${hourStr}:00:00.000+07:00`);

        // ตรวจสอบเงื่อนไข 1: มีหมอเข้างานหรือไม่
        const doctorSchedules = await prisma.work_schedule.findMany({
            where: {
                date: targetDate,
                is_active: true,
                staff: {
                    staff_role: "DOCTOR"
                }
            }
        });

        let availableDoctorsCount = 0;
        for (const schedule of doctorSchedules) {
            const startHour = schedule.starttime.getUTCHours();
            const startMinute = schedule.starttime.getUTCMinutes();
            const endHour = schedule.endtime.getUTCHours();
            const endMinute = schedule.endtime.getUTCMinutes();

            const scheduleStartVal = startHour + startMinute / 60;
            const scheduleEndVal = endHour + endMinute / 60;
            const slotStartVal = hour;
            const slotEndVal = hour + 1; // กินเวลา 1 ชม.

            if (scheduleStartVal <= slotStartVal && scheduleEndVal >= slotEndVal) {
                availableDoctorsCount++;
            }
        }

        if (availableDoctorsCount === 0) {
            return NextResponse.json({ message: "ไม่มีแพทย์ออกตรวจในเวลานี้" }, { status: 400 });
        }

        // ตรวจสอบเงื่อนไข 2: หาคิวสูงสุดที่รับได้เทียบกับยอดจอง
        const totalRooms = await prisma.room.count({
            where: { status: "AVAILABLE" }
        });

        const maxAppointmentsCapacity = Math.min(totalRooms, availableDoctorsCount);

        const appointmentsAtSlot = await prisma.appointment.count({
            where: {
                datetime: slotDateTime,
                status: {
                    not: "CANCELLED"
                }
            }
        });

        if (appointmentsAtSlot >= maxAppointmentsCapacity) {
            return NextResponse.json({ message: "คิวเต็มแล้วสำหรับเวลานี้ (ไม่มีแพทย์หรือห้องว่างพอ)" }, { status: 400 });
        }

        // ตรวจสอบว่าผู้ป่วยจองซ้ำในเวลาเดียวกันหรือไม่
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                patient_id: patientId,
                datetime: slotDateTime,
                status: {
                    not: "CANCELLED"
                }
            }
        });

        if (existingAppointment) {
            return NextResponse.json({ message: "คนไข้รายนี้ได้ทำการจองเวลานี้เเล้ว" }, { status: 400 });
        }

        // บันทึกตารางนัดหมายใหม่
        const newAppointment = await prisma.appointment.create({
            data: {
                patient_id: patientId,
                datetime: slotDateTime,
                status: "CONFIRMED" // ตั้งให้ยืนยันการจองทันทีเมื่อผู้ช่วยแพทย์เป็นคนคีย์
            }
        });

        return NextResponse.json({
            message: "Appointment created successfully",
            appointment: newAppointment
        }, { status: 201 });

    } catch (error) {
        console.error("Error creating med assist appointment:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
