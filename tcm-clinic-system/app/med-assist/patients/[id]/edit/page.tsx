"use client";

import { formatPhoneNumber } from "@/app/utils/formatPhoneNumber";
import { formatThaiId } from "@/app/utils/formatThaiId";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { differenceInYears, format } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, Save } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EditPatientFormData = {
  first_name: string;
  last_name: string;
  thai_id: string;
  birthdate: string;
  gender: "MALE" | "FEMALE";
  phone_number: string;
  blood_group: "A" | "B" | "AB" | "O";
  chronic_disease: string;
};

function formatThaiDateWithBuddhistYear(date: Date) {
  return `${format(date, "d MMMM", { locale: th })} ${date.getFullYear() + 543}`;
}

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: patientId } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [birthdateOpen, setBirthdateOpen] = useState(false);
  const [formData, setFormData] = useState<EditPatientFormData>({
    first_name: "",
    last_name: "",
    thai_id: "",
    birthdate: "",
    gender: "MALE",
    phone_number: "",
    blood_group: "O",
    chronic_disease: "",
  });

  const birthdateValue = formData.birthdate
    ? new Date(`${formData.birthdate}T00:00:00`)
    : undefined;
  const birthdateLabel = birthdateValue
    ? `${formatThaiDateWithBuddhistYear(birthdateValue)} (อายุ ${differenceInYears(
        new Date(),
        birthdateValue
      )} ปี)`
    : null;

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${patientId}`);
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        const birthdate = data.birthdate
          ? new Date(data.birthdate).toISOString().split("T")[0]
          : "";

        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          thai_id: data.thai_id || "",
          birthdate,
          gender: data.gender || "MALE",
          phone_number: data.phone_number || "",
          blood_group: data.blood_group || "O",
          chronic_disease: data.chronic_disease || "",
        });
      } catch (error) {
        console.error("Failed to fetch patient:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPatient();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push(`/med-assist/patients/${patientId}`);
        router.refresh();
        return;
      }

      const errorData = await res.json();
      alert(`Failed to update: ${errorData.error || "Unknown error"}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/med-assist/patients">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            แก้ไขข้อมูลคนไข้
          </h1>
          <p className="mt-1 text-muted-foreground">
            อัปเดตข้อมูลพื้นฐานของคนไข้
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              ชื่อ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              required
              disabled={saving}
              value={formData.first_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, first_name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              นามสกุล <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              required
              disabled={saving}
              value={formData.last_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, last_name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thai_id">
              เลขบัตรประชาชน <span className="text-red-500">*</span>
            </Label>
            <Input
              id="thai_id"
              required
              disabled={saving}
              value={formatThaiId(formData.thai_id)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  thai_id: e.target.value.replace(/\D/g, "").slice(0, 13),
                }))
              }
              maxLength={17}
              placeholder="x-xxxx-xxxxx-xx-x"
            />
            <p className="text-xs text-muted-foreground">ตัวเลข 13 หลัก</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthdate">
              วันเกิด <span className="text-red-500">*</span>
            </Label>
            <Popover open={birthdateOpen} onOpenChange={setBirthdateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="birthdate"
                  type="button"
                  variant="outline"
                  disabled={saving}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdateValue && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdateLabel ? (
                    birthdateLabel
                  ) : (
                    <span>เลือกวันเกิด</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={birthdateValue}
                  defaultMonth={birthdateValue}
                  captionLayout="dropdown"
                  formatters={{
                    formatCaption: (date) =>
                      `${format(date, "LLLL", { locale: th })} ${date.getFullYear() + 543}`,
                    formatMonthDropdown: (date) =>
                      format(date, "LLLL", { locale: th }),
                    formatYearDropdown: (date) =>
                      String(date.getFullYear() + 543),
                  }}
                  onSelect={(date) => {
                    setFormData((prev) => ({
                      ...prev,
                      birthdate: date ? format(date, "yyyy-MM-dd") : "",
                    }));
                    setBirthdateOpen(false);
                  }}
                  locale={th}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <Label htmlFor="gender">
              เพศ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  gender: value as "MALE" | "FEMALE",
                }))
              }
              disabled={saving}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="เลือกเพศ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">ชาย (Male)</SelectItem>
                <SelectItem value="FEMALE">หญิง (Female)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone_number"
              type="tel"
              required
              disabled={saving}
              value={formatPhoneNumber(formData.phone_number)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone_number: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              maxLength={12}
              placeholder="099-999-9999"
            />
            <p className="text-xs text-muted-foreground">ตัวเลข 10 หลัก</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="blood_group">
              หมู่เลือด <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.blood_group}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  blood_group: value as "A" | "B" | "AB" | "O",
                }))
              }
              disabled={saving}
            >
              <SelectTrigger id="blood_group">
                <SelectValue placeholder="เลือกหมู่เลือด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">กรุ๊ป A</SelectItem>
                <SelectItem value="B">กรุ๊ป B</SelectItem>
                <SelectItem value="AB">กรุ๊ป AB</SelectItem>
                <SelectItem value="O">กรุ๊ป O</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="chronic_disease">โรคประจำตัว</Label>
            <textarea
              id="chronic_disease"
              name="chronic_disease"
              value={formData.chronic_disease}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  chronic_disease: e.target.value,
                }))
              }
              rows={2}
              placeholder="ระบุโรคประจำตัว (ถ้ามี)"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : "อัปเดตข้อมูล"}
          </Button>
        </div>
      </form>
    </div>
  );
}
