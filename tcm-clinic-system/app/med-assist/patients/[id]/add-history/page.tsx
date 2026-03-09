"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function AddHealthHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    bp: "",
    temp: "",
    pulse: "",
    symptoms: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patient_id: id,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      bp: formData.bp || null,
      symptoms: formData.symptoms || null,
      vitals: {
        Temperature: formData.temp,
        Pulse: formData.pulse,
      },
    };

    try {
      const res = await fetch("/api/health-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/med-assist/patients/${id}`);
        router.refresh();
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
        <Link href={`/med-assist/patients/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ซักประวัติใหม่ (Add History)</h1>
          <p className="text-muted-foreground mt-1">
            บันทึกข้อมูลสุขภาพและอาการเบื้องต้นของคนไข้ รหัส PT-{id}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-lg bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">น้ำหนัก (กิโลกรัม)</Label>
            <Input type="number" step="0.1" id="weight" name="weight" value={formData.weight} onChange={handleChange} placeholder="เช่น 65.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">ส่วนสูง (เซนติเมตร)</Label>
            <Input type="number" step="0.1" id="height" name="height" value={formData.height} onChange={handleChange} placeholder="เช่น 170" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bp">ความดันโลหิต (mmHg)</Label>
            <Input id="bp" name="bp" value={formData.bp} onChange={handleChange} placeholder="เช่น 120/80" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temp">อุณหภูมิร่างกาย (°C)</Label>
            <Input type="number" step="0.1" id="temp" name="temp" value={formData.temp} onChange={handleChange} placeholder="เช่น 36.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pulse">ชีพจร (ครั้ง/นาที)</Label>
            <Input type="number" id="pulse" name="pulse" value={formData.pulse} onChange={handleChange} placeholder="เช่น 80" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="symptoms">อาการสำคัญ (Symptoms) <span className="text-red-500">*</span></Label>
            <textarea
              id="symptoms"
              name="symptoms"
              required
              rows={4}
              value={formData.symptoms}
              onChange={handleChange}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="ระบุอาการที่มาพบแพทย์..."
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "กำลังบันทึก..." : "บันทึกประวัติการตรวจ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
