"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears, format } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowLeft, CalendarIcon, Save } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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

const createPatientSchema = z.object({
  first_name: z.string().min(1, "กรุณากรอกชื่อ"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  thai_id: z.string().length(13, "กรุณากรอกเลขบัตรประชาชน 13 หลัก"),
  birthdate: z.string().min(1, "กรุณาเลือกวันเกิด"),
  gender: z.enum(["MALE", "FEMALE"], {
    message: "กรุณาเลือกเพศ",
  }),
  phone_number: z.string().length(10, "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"),
  blood_group: z.enum(["A", "B", "AB", "O"], {
    message: "กรุณาเลือกหมู่เลือด",
  }),
  chronic_disease: z.string().optional(),
});

type CreatePatientFormValues = z.infer<typeof createPatientSchema>;

export default function CreatePatientPage() {
  const router = useRouter();
  const [birthdateOpen, setBirthdateOpen] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      thai_id: "",
      birthdate: "",
      gender: undefined,
      phone_number: "",
      blood_group: undefined,
      chronic_disease: "",
    },
  });

  const birthdate = watch("birthdate");
  const birthdateValue = birthdate
    ? new Date(`${birthdate}T00:00:00`)
    : undefined;
  const birthdateLabel = birthdateValue
    ? `${format(birthdateValue, "PPP", { locale: th })} (อายุ ${differenceInYears(new Date(), birthdateValue)} ปี)`
    : null;

  const onSubmit = async (data: CreatePatientFormValues) => {
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/med-assist/patients");
        router.refresh();
        return;
      }

      const errorData = await res.json();
      alert(`Failed to save: ${errorData.error || "Unknown error"}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

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
            ลงทะเบียนคนไข้ใหม่
          </h1>
          <p className="mt-1 text-muted-foreground">
            กรอกข้อมูลพื้นฐานของคนไข้เพื่อเพิ่มเข้าสู่ระบบ
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border bg-card p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              ชื่อ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              disabled={isSubmitting}
              {...register("first_name")}
              className={errors.first_name ? "border-destructive" : ""}
            />
            {errors.first_name && (
              <p className="text-xs text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              นามสกุล <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              disabled={isSubmitting}
              {...register("last_name")}
              className={errors.last_name ? "border-destructive" : ""}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thai_id">
              เลขบัตรประชาชน <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="thai_id"
              render={({ field }) => (
                <Input
                  id="thai_id"
                  disabled={isSubmitting}
                  value={formatThaiId(field.value)}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 13),
                    )
                  }
                  maxLength={17}
                  placeholder="x-xxxx-xxxxx-xx-x"
                  className={errors.thai_id ? "border-destructive" : ""}
                />
              )}
            />
            {errors.thai_id ? (
              <p className="text-xs text-destructive">
                {errors.thai_id.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">ตัวเลข 13 หลัก</p>
            )}
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
                  disabled={isSubmitting}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdateValue && "text-muted-foreground",
                    errors.birthdate && "border-destructive",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdateLabel ? birthdateLabel : <span>เลือกวันเกิด</span>}
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
                  onSelect={(date) => {
                    setValue(
                      "birthdate",
                      date ? format(date, "yyyy-MM-dd") : "",
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      },
                    );
                    setBirthdateOpen(false);
                  }}
                  locale={th}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.birthdate && (
              <p className="text-xs text-destructive">
                {errors.birthdate.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="gender">
              เพศ <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="gender"
                    className={cn(
                      "w-full",
                      errors.gender && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">ชาย (Male)</SelectItem>
                    <SelectItem value="FEMALE">หญิง (Female)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && (
              <p className="text-xs text-destructive">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="phone_number"
              render={({ field }) => (
                <Input
                  id="phone_number"
                  type="tel"
                  disabled={isSubmitting}
                  value={formatPhoneNumber(field.value)}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  maxLength={12}
                  placeholder="099-999-9999"
                  className={errors.phone_number ? "border-destructive" : ""}
                />
              )}
            />
            {errors.phone_number ? (
              <p className="text-xs text-destructive">
                {errors.phone_number.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">ตัวเลข 10 หลัก</p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="blood_group">
              หมู่เลือด <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="blood_group"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="blood_group"
                    className={cn(
                      "w-full",
                      errors.blood_group && "border-destructive",
                    )}
                  >
                    <SelectValue placeholder="เลือกหมู่เลือด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">กรุ๊ป A</SelectItem>
                    <SelectItem value="B">กรุ๊ป B</SelectItem>
                    <SelectItem value="AB">กรุ๊ป AB</SelectItem>
                    <SelectItem value="O">กรุ๊ป O</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.blood_group && (
              <p className="text-xs text-destructive">
                {errors.blood_group.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronic_disease">
              โรคประจำตัว{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (ถ้ามี)
              </span>
            </Label>
            <Input
              id="chronic_disease"
              disabled={isSubmitting}
              placeholder="เช่น เบาหวาน, ความดัน (หรือเว้นว่างถ้าไม่มี)"
              {...register("chronic_disease")}
            />
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="h-4 w-4" />
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูลคนไข้"}
          </Button>
        </div>
      </form>
    </div>
  );
}
