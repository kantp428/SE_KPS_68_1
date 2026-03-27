"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  Activity,
  ReceiptText,
  ArrowRight,
  HeartPulse,
  UserPlus,
  ClipboardPlus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StaffHome() {
  const [statsData, setStatsData] = useState({
    appointmentCount: 0,
    inProgressCount: 0,
    unpaidInvoiceCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/med-assist/stats");
        setStatsData(res.data);
      } catch (error) {
        console.error("Failed to fetch med-assist stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      title: "นัดหมายวันนี้",
      value: isLoading ? "..." : String(statsData.appointmentCount),
      icon: Calendar,
      description: "คนไข้ที่มีคิวนัดหมายวันนี้",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "กำลังรักษา",
      value: isLoading ? "..." : String(statsData.inProgressCount),
      icon: Activity,
      description: "คนไข้ที่กำลังอยู่ในการรักษาขณะนี้",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "รอชำระเงิน",
      value: isLoading ? "..." : String(statsData.unpaidInvoiceCount),
      icon: ReceiptText,
      description: "รายการที่รอการชำระเงิน",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];


  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-10">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600 p-8 md:p-10 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 opacity-10">
          <HeartPulse className="h-64 w-64 rotate-12" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md">
            {"ผู้ช่วยแพทย์"}
          </div>
          <p className="text-3xl md:text-4xl font-bold tracking-tight">
            ระบบจัดการคลินิก
          </p>

          <p className="max-w-xl text-emerald-50/90 text-lg">
            ยินดีต้อนรับสู่ระบบจัดการข้อมูลคนไข้และการนัดหมาย โปรดตรวจสอบรายการนัดหมายและเตรียมความพร้อมสำหรับผู้รับบริการในวันนี้
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="/med-assist/appointment">
              <Button className="rounded-full bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg font-semibold h-11 px-6 transition-all transform hover:scale-105 active:scale-95">
                ดูคิวการนัดหมาย <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-lg transition-all overflow-hidden group">
            <CardContent className="p-0">
              <div className="p-6 flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${stat.bgColor} flex items-center justify-center ${stat.color} shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`h-1 w-full ${stat.bgColor.replace('50', '200')}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Banner */}
      <div className="bg-white rounded-3xl border border-sky-100 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl font-bold text-sky-950">จัดการข้อมูลคนไข้</h2>
          <p className="text-muted-foreground">คุณสามารถลงทะเบียนคนไข้ใหม่หรือเปิดรายการรักษาได้ทันที</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
          <Link href="/med-assist/patients/create">
            <Button variant="outline" className="w-full rounded-full h-11 px-6 border-sky-200 text-sky-900 hover:bg-sky-50 shadow-sm transition-all active:scale-95">
              <UserPlus className="mr-2 h-4 w-4" /> ลงทะเบียนคนไข้
            </Button>
          </Link>
          <Link href="/med-assist/treatment/new">
            <Button className="w-full rounded-full h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95">
              <ClipboardPlus className="mr-2 h-4 w-4" /> เปิดการรักษา
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

