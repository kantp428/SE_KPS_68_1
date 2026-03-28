"use client";
// วางที่: app/docter/schedule/staff_mode/page.tsx
import PersonalWeeklyCalendar from "@/components/layout/schedule/PersonalWeeklyCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Clock } from "lucide-react";

export default function StaffSchedulePage() {
  const auth = useAuth();
  const staffId = auth.user?.staff?.id;
  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight">
          ตารางงานของฉัน
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          ตารางการทำงานประจำสัปดาห์
        </p>
      </div>
      {auth.isLoading ? (
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-5 w-32" />
        </div>
      ) : !staffId ? (
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 opacity-20" />
          <p>ไม่พบข้อมูลบุคลากรของบัญชีที่ล็อกอินอยู่</p>
        </div>
      ) : (
        <PersonalWeeklyCalendar staffId={staffId} />
      )}
    </div>
  );
}
