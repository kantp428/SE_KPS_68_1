import prisma from "@/lib/prisma";
import { staff_role_enum } from "@prisma/client";
import { NextResponse } from "next/server";

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map((v) => parseInt(v, 10));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
};

const dateToMinutes = (date: Date) =>
  date.getUTCHours() * 60 + date.getUTCMinutes();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const dateParam = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}`;
    const timeParam = searchParams.get("time");
    const search = searchParams.get("search")?.trim();
    const selectedMinutes = timeParam ? toMinutes(timeParam) : null;
    const [year, month, day] = dateParam.split("-").map((v) => parseInt(v, 10));
    const dateStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dateEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const schedules = await prisma.work_schedule.findMany({
      where: {
        is_active: true,
        date: {
          gte: dateStart,
          lte: dateEnd,
        },
        staff: {
          staff_role: staff_role_enum.DOCTOR,
          ...(search
            ? {
                OR: [
                  { first_name: { contains: search, mode: "insensitive" } },
                  { last_name: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      },
      include: {
        staff: true,
      },
      orderBy: [{ starttime: "asc" }],
    });

    const filteredSchedules =
      selectedMinutes === null
        ? schedules
        : schedules.filter((schedule) => {
            const startMinutes = dateToMinutes(schedule.starttime);
            const endMinutes = dateToMinutes(schedule.endtime);
            return selectedMinutes >= startMinutes && selectedMinutes <= endMinutes;
          });

    const doctorMap = new Map<
      number,
      {
        value: number;
        label: string;
        scheduleStart: Date;
        scheduleEnd: Date;
      }
    >();

    for (const schedule of filteredSchedules) {
      const existing = doctorMap.get(schedule.staff_id);
      if (!existing) {
        doctorMap.set(schedule.staff_id, {
          value: schedule.staff_id,
          label: `${schedule.staff.first_name} ${schedule.staff.last_name}`,
          scheduleStart: schedule.starttime,
          scheduleEnd: schedule.endtime,
        });
        continue;
      }

      if (schedule.starttime < existing.scheduleStart) {
        existing.scheduleStart = schedule.starttime;
      }
      if (schedule.endtime > existing.scheduleEnd) {
        existing.scheduleEnd = schedule.endtime;
      }
    }

    return NextResponse.json({
      data: Array.from(doctorMap.values()).map((doctor) => ({
        value: doctor.value,
        label: doctor.label,
        scheduleStart: doctor.scheduleStart,
        scheduleEnd: doctor.scheduleEnd,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
