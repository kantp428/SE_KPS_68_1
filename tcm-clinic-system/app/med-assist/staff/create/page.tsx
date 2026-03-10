"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    gender: "",
    phone_number: "",
    staff_role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("เพิ่มพนักงานสำเร็จ!");
        router.push("/med-assist/staff");
        router.refresh(); 
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || "Unknown error"}`);
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
        <Link href="/med-assist/staff">
          <Button variant="outline" size="icon" >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">เพิ่มพนักงานใหม่</h1>
          <p className="text-muted-foreground mt-1">กรอกข้อมูลเพื่อสร้างบัญชีและข้อมูลพนักงานใหม่เข้าสู่ระบบ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-lg bg-card p-6 space-y-8">
        {/* Account Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">1. ข้อมูลการเข้าสู่ระบบ (Account)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span></Label>
              <Input id="username" name="username" required value={formData.username} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล (Email) <span className="text-red-500">*</span></Label>
              <Input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน (Password) <span className="text-red-500">*</span></Label>
              <Input type="password" id="password" name="password" required value={formData.password} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">ยืนยันรหัสผ่าน (Confirm Password) <span className="text-red-500">*</span></Label>
              <Input type="password" id="confirm_password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Staff Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">2. ข้อมูลทั่วไป (Staff Info)</h2>
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
            
            <div className="space-y-2">
              <Label htmlFor="staff_role">ตำแหน่ง <span className="text-red-500">*</span></Label>
              <select
                id="staff_role"
                name="staff_role"
                required
                value={formData.staff_role}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled hidden>-- กรุณาเลือกตำแหน่ง --</option>
                <option value="DOCTOR">แพทย์ (Doctor)</option>
                <option value="MED_ASSISTANT">ผู้ช่วยแพทย์ (Med-Assistant)</option>
              </select>
            </div>
            
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
           <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>ยกเลิก</Button>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "กำลังบันทึก..." : "ยืนยันและสร้างพนักงาน"}
          </Button>
        </div>
      </form>
    </div>
  );
}
