"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Save, Lock } from "lucide-react";

export default function EditOwnProfilePage() {
  const router = useRouter();
  // Mocking the authenticated patient to be ID 1 for demonstration purposes.
  const mockPatientId = 1;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    thai_id: "",
    birthdate: "",
    gender: "MALE",
    phone_number: "",
    blood_group: "O",
    chronic_disease: "",
  });

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${mockPatientId}`);
        if (res.ok) {
          const data = await res.json();
          // Format date for the input field
          const bdate = data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : "";
          
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            thai_id: data.thai_id || "",
            birthdate: bdate,
            gender: data.gender || "MALE",
            phone_number: data.phone_number || "",
            blood_group: data.blood_group || "O",
            chronic_disease: data.chronic_disease || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch patient:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [mockPatientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/patients/${mockPatientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/patient/profile`);
        router.refresh();
      } else {
        const errorData = await res.json();
        alert(`Failed to update: ${errorData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/patient/profile`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แก้ไขข้อมูลส่วนตัว</h1>
          <p className="text-muted-foreground mt-1">
            ท่านสามารถอัปเดตข้อมูลการติดต่อและข้อมูลสุขภาพพื้นฐานได้
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-lg bg-card p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">ชื่อ <span className="text-red-500">*</span></Label>
            <Input id="first_name" name="first_name" required value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">นามสกุล <span className="text-red-500">*</span></Label>
            <Input id="last_name" name="last_name" required value={formData.last_name} onChange={handleChange} />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="thai_id" className="flex items-center gap-2">
              เลขบัตรประชาชน 
              <Lock className="w-3 h-3 text-muted-foreground" />
            </Label>
            <Input 
              id="thai_id" 
              name="thai_id" 
              value={formData.thai_id} 
              disabled 
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              ไม่อนุญาตให้แก้ไขเลขบัตรประชาชน หากต้องการแก้ไขโปรดติดต่อเจ้าหน้าที่คลินิก
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">วันเกิด <span className="text-red-500">*</span></Label>
            <Input type="date" id="birthdate" name="birthdate" required value={formData.birthdate} onChange={handleChange} />
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
              <option value="MALE">ชาย (Male)</option>
              <option value="FEMALE">หญิง (Female)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
            <Input type="tel" id="phone_number" name="phone_number" required value={formData.phone_number} onChange={handleChange} />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </form>
    </div>
  );
}
