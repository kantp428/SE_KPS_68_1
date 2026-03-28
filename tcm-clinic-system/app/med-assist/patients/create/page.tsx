"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function CreatePatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    thai_id: "",
    birthdate: "",
    gender: "",
    phone_number: "",
    blood_group: "",
    chronic_disease: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/med-assist/patients");
        router.refresh(); // Refresh the list page
      } else {
        const errorData = await res.json();
        alert(`Failed to save: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/med-assist/patients">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ลงทะเบียนคนไข้ใหม่</h1>
          <p className="text-muted-foreground mt-1">กรอกข้อมูลพื้นฐานของคนไข้เพื่อเพิ่มเข้าสู่ระบบ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-lg bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">ชื่อ <span className="text-red-500">*</span></Label>
            <Input id="first_name" name="first_name" required value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">นามสกุล <span className="text-red-500">*</span></Label>
            <Input id="last_name" name="last_name" required value={formData.last_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thai_id">เลขบัตรประชาชน <span className="text-red-500">*</span></Label>
            <Input 
              id="thai_id" 
              name="thai_id" 
              required 
              value={formData.thai_id} 
              onChange={handleChange} 
              minLength={13} 
              maxLength={13} 
              pattern="[0-9]{13}" 
              title="กรุณากรอกตัวเลข 13 หลัก"
              placeholder="xxxxxxxxxxxxx"
            />
            <p className="text-xs text-muted-foreground mt-1">ตัวเลข 13 หลัก</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthdate">วันเกิด <span className="text-red-500">*</span></Label>
            <Input type="date" id="birthdate" name="birthdate" required value={formData.birthdate} onChange={handleChange} />
          </div>
          <div className="space-y-3">
            <Label htmlFor="gender">เพศ <span className="text-red-500">*</span></Label>
            <select
              id="gender"
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled hidden>-- กรุณาเลือกเพศ --</option>
              <option value="MALE">ชาย (Male)</option>
              <option value="FEMALE">หญิง (Female)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
            <Input 
              type="tel" 
              id="phone_number" 
              name="phone_number" 
              required 
              value={formData.phone_number} 
              onChange={handleChange} 
              minLength={10} 
              maxLength={10} 
              pattern="[0-9]{10}"
              title="กรุณากรอกตัวเลข 10 หลัก"
              placeholder="08xxxxxxxx"
            />
              <p className="text-xs text-muted-foreground mt-1">ตัวเลข 10 หลัก</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="blood_group">หมู่เลือด <span className="text-red-500">*</span></Label>
            <select
              id="blood_group"
              name="blood_group"
              required
              value={formData.blood_group}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled hidden>-- กรุณาเลือกหมู่เลือด --</option>
              <option value="A">กรุ๊ป A</option>
              <option value="B">กรุ๊ป B</option>
              <option value="AB">กรุ๊ป AB</option>
              <option value="O">กรุ๊ป O</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronic_disease">โรคประจำตัว <span className="text-muted-foreground text-xs font-normal">(ถ้ามี)</span></Label>
            <Input id="chronic_disease" name="chronic_disease" value={formData.chronic_disease} onChange={handleChange} placeholder="เช่น เบาหวาน, ความดัน (หรือเว้นว่างถ้าไม่มี)" />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูลคนไข้"}
          </Button>
        </div>
      </form>
    </div>
  );
}
