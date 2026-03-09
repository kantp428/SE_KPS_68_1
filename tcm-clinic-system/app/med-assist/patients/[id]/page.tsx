import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patientId = parseInt(id, 10);
  
  if (isNaN(patientId)) {
    return notFound();
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/med-assist/patients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ข้อมูลคนไข้</h1>
            <p className="text-muted-foreground mt-1">
              ข้อมูลทั่วไปและประวัติการรักษาส่วนตัว
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/med-assist/patients/${patient.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit2 className="w-4 h-4" />
              แก้ไขข้อมูล
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 bg-card border rounded-lg p-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">ข้อมูลส่วนตัว</h2>
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">ชื่อ-นามสกุล:</span> {patient.first_name} {patient.last_name}</p>
            <p><span className="font-medium">เลขบัตรประชาชน:</span> {patient.thai_id}</p>
            <p><span className="font-medium">เพศ:</span> {patient.gender === "MALE" ? "ชาย" : patient.gender === "FEMALE" ? "หญิง" : patient.gender}</p>
            <p><span className="font-medium">วันเกิด:</span> {patient.birthdate ? new Date(patient.birthdate).toLocaleDateString("th-TH") : "-"}</p>
            <p><span className="font-medium">เบอร์โทรศัพท์:</span> {patient.phone_number}</p>
            <p><span className="font-medium">หมู่เลือด:</span> {patient.blood_group}</p>
            <p><span className="font-medium">โรคประจำตัว:</span> {patient.chronic_disease || "ไม่มี"}</p>
          </div>
        </div>
      </div>


    </div>
  );
}
