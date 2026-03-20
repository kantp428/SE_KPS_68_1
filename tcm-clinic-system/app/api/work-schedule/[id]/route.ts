// วางที่: app/api/work-schedule/[id]/route.ts
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// [UPDATE] PATCH /api/work-schedule/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id   = parseInt(rawId)
    const body = await req.json()
    const { date, starttime, endtime, is_active } = body

    const updated = await prisma.work_schedule.update({
      where: { id },
      data: {
        ...(date      !== undefined && { date:      new Date(date) }),
        ...(starttime !== undefined && { starttime: new Date(`1970-01-01T${starttime}Z`) }),
        ...(endtime   !== undefined && { endtime:   new Date(`1970-01-01T${endtime}Z`) }),
        ...(is_active !== undefined && { is_active }),
      },
      include: {
        staff: {
          select: { id: true, first_name: true, last_name: true, staff_role: true },
        },
      },
    })

    return NextResponse.json({
      ...updated,
      date:      updated.date.toISOString().slice(0, 10),
      starttime: updated.starttime.toISOString().slice(11, 19),
      endtime:   updated.endtime.toISOString().slice(11, 19),
    })
  } catch (error) {
    console.error("[PATCH /api/work-schedule/[id]]", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// [DELETE] DELETE /api/work-schedule/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    await prisma.work_schedule.delete({ where: { id } })
    return NextResponse.json({ message: "ลบสำเร็จ" })
  } catch (error) {
    console.error("[DELETE /api/work-schedule/[id]]", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}