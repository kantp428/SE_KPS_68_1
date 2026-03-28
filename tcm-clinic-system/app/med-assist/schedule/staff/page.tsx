import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";

import WeeklyCalendar from "@/components/layout/schedule/WeeklyCalendar";
import { Button } from "@/components/ui/button";

export default function StaffSchedulePage() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ตารางงานรวม</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            ภาพรวมตารางการทำงานของบุคลากรทั้งหมด
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/med-assist/schedule">
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/med-assist/schedule/manage">
              <Settings2 className="h-4 w-4" />
              จัดการตารางงาน
            </Link>
          </Button>
        </div>
      </div>

      <WeeklyCalendar />
    </div>
  );
}
