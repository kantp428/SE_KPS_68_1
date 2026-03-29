"use client";

import { useEffect, useState } from "react";
import { useAppointment } from "@/hooks/useAppointment";
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { AppointmentData } from "@/types/appointment";
import { 
  CalendarDays, 
  Clock, 
  AlertCircle, 
  Loader2, 
  XCircle, 
  CheckCircle2, 
  CalendarX2,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PatientAppointmentListPage() {
  const { fetchPatientAppointments, loading: fetchLoading } = useAppointment();
  const { updateAppointmentStatus, loading: updateLoading } = useAppointmentStatusUpdate();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      const data = await fetchPatientAppointments();
      setAppointments(data);
    } catch (err) {
      setError("ไม่สามารถดึงข้อมูลการจองได้");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [fetchPatientAppointments]);

  const handleCancel = async (id: number) => {
    try {
      await updateAppointmentStatus(id, "CANCELLED");
      toast.success("ยกเลิกการจองเรียบร้อยแล้ว");
      loadAppointments(); // Refresh list
    } catch (err) {
      toast.error("ไม่สามารถยกเลิกการจองได้");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">ยืนยันแล้ว</Badge>;
      case "PENDING":
        return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">รอดำเนินการ</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary" className="text-slate-500">ยกเลิกแล้ว</Badge>;
      case "COMPLETED":
        return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200">เสร็จสิ้น</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} น.`;
  };

  if (fetchLoading && appointments.length === 0) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">กำลังโหลดรายการจอง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-950 dark:text-foreground">รายการการจองของฉัน</h1>
          <p className="text-muted-foreground mt-1">
            ตรวจสอบและจัดการประวัติการนัดหมายของคุณ
          </p>
        </div>
        <Link href="/patient/appointment">
          <Button className="rounded-full shadow-md bg-emerald-600 hover:bg-emerald-700">
            <PlusCircle className="mr-2 h-4 w-4" /> จองคิวใหม่
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-2xl border border-dashed border-destructive/20 gap-4">
          <AlertCircle className="w-12 h-12 text-destructive opacity-50" />
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={loadAppointments}>ลองใหม่อีกครั้ง</Button>
        </div>
      ) : appointments.filter(a => a.status === "CONFIRMED").length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border border-dashed border-sky-200 dark:border-border gap-6 shadow-sm">
          <div className="w-20 h-20 bg-sky-50 dark:bg-sky-950/30 rounded-full flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-sky-200 dark:text-sky-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-sky-900 dark:text-foreground">ไม่พบรายการจองที่ยืนยันแล้ว</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              คุณยังไม่มีรายการจองที่ยืนยันแล้วในขณะนี้
            </p>
          </div>
          <Link href="/patient/appointment">
            <Button size="lg" className="rounded-full px-8">ไปหน้าจองคิว</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments
            .filter((a) => a.status === "CONFIRMED")
            .map((appointment) => {
              const isCancellable = true; // Show for all CONFIRMED as requested
            
            return (
              <Card key={appointment.id} className="overflow-hidden border-sky-100 dark:border-border shadow-sm transition-all hover:shadow-md hover:border-sky-200 dark:hover:border-primary/50 rounded-2xl">
                <CardHeader className="pb-4 bg-sky-50/50 dark:bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sky-900 dark:text-foreground">
                        <CalendarDays className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        <CardTitle className="text-lg">{formatDate(appointment.datetime)}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Clock className="w-4 h-4" />
                        <span>เวลา {formatTime(appointment.datetime)}</span>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                {/* <CardContent className="pt-6 pb-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-muted">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">บริการ</p>
                      <p className="font-semibold text-sky-900">การรักษาแพทย์แผนจีน</p>
                    </div>
                  </div>
                </CardContent> */}
                <CardFooter className="pt-2 pb-6 px-6">
                  {isCancellable ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors">
                          <XCircle className="mr-2 h-4 w-4" /> ยกเลิกการจอง
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <CalendarX2 className="w-5 h-5" /> ยืนยันการยกเลิก
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? เมื่อยกเลิกแล้วคุณจะไม่สามารถกู้คืนรายการจองนี้ได้ แต่สามารถจองใหม่ได้ภายหลัง
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="bg-muted p-4 rounded-xl space-y-2 text-sm mt-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">วันที่:</span>
                            <span className="font-semibold">{formatDate(appointment.datetime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">เวลา:</span>
                            <span className="font-semibold">{formatTime(appointment.datetime)}</span>
                          </div>
                        </div>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel className="rounded-xl">ปิด</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                            onClick={() => handleCancel(appointment.id)}
                            disabled={updateLoading}
                          >
                            {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ยืนยันยกเลิกการจอง"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button variant="ghost" className="w-full rounded-xl cursor-default opacity-50" disabled>
                      <ChevronRight className="mr-2 h-4 w-4" /> ดูรายละเอียด
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
