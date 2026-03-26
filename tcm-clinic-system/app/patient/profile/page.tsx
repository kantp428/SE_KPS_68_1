"use client";

import { UserCircle2Icon, Edit2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function OwnPatientProfilePage() {
  const { user, isLoading } = useAuth() || {};

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">กำลังโหลดข้อมูลส่วนตัว...</p>
        </div>
      </div>
    );
  }

  const patient = user?.patient;

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <UserCircle2Icon className="w-16 h-16 text-muted-foreground opacity-50" />
        <h2 className="text-xl font-semibold">ไม่พบข้อมูลส่วนตัว</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          ไม่สามารถดึงข้อมูลส่วนตัวได้ในขณะนี้ อาจจะยังไม่มีการผูกบัญชีกับประวัติคนไข้ (ID: 1)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ข้อมูลส่วนตัว</h1>
          <p className="text-muted-foreground mt-1">
            ข้อมูลพื้นฐานของคุณที่ลงทะเบียนไว้กับทางคลินิก
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-3">
            <UserCircle2Icon className="w-5 h-5 text-primary" />
            ข้อมูลทั่วไป
          </h2>
          <div className="space-y-4 text-sm md:text-base">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">ชื่อ-นามสกุล</span>
              <span className="col-span-2 font-medium">{patient.first_name} {patient.last_name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">เลขบัตรประชาชน</span>
              {/* The thai_id is already decrypted when sent from the /api/auth/me route */}
              <span className="col-span-2 font-medium">{patient.thai_id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">วันเกิด</span>
              <span className="col-span-2 font-medium">
                {patient.birthdate ? new Date(patient.birthdate).toLocaleDateString("th-TH") : "-"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">เพศ</span>
              <span className="col-span-2 font-medium">
                {patient.gender === "MALE" ? "ชาย" : patient.gender === "FEMALE" ? "หญิง" : patient.gender}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">เบอร์โทรศัพท์</span>
              <span className="col-span-2 font-medium">{patient.phone_number}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">หมู่เลือด</span>
              <span className="col-span-2 font-medium">{patient.blood_group}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-muted-foreground">โรคประจำตัว</span>
              <span className="col-span-2 font-medium">{patient.chronic_disease || "ไม่มี"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
