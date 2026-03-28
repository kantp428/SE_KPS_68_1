"use client";

import Link from "next/link";
import { LayoutGrid, Clock } from "lucide-react";

import PersonalWeeklyCalendar from "@/components/layout/schedule/PersonalWeeklyCalendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

export default function SchedulePage() {
  const auth = useAuth();
  const staffId = auth.user?.staff?.id;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight">
            ตารางงานของฉัน
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            ตารางการทำงานประจำสัปดาห์
          </p>
        </div>

        <Button asChild variant="default" className="gap-2">
          <Link href="/doctor/schedule/staff">
            <LayoutGrid className="h-4 w-4" />
            ตารางงานรวม
          </Link>
        </Button>
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
