"use client";

import { handleException } from "@/app/utils/handleException";
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
import { useRegister } from "@/hooks/useRegister";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInYears, format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
    password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(6, "กรุณายืนยันรหัสผ่าน"),
    firstName: z.string().min(1, "กรุณากรอกชื่อ"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    thaiId: z.string().length(13, "รหัสบัตรประชาชนต้องมี 13 หลัก"),
    birthdate: z.string().min(1, "กรุณาเลือกวันเกิด"),
    gender: z.enum(["MALE", "FEMALE"], {
      message: "กรุณาเลือกเพศ",
    }),
    phoneNumber: z.string().length(10, "เบอร์โทรศัพท์ต้องมี 10 หลัก"),
    bloodGroup: z.enum(["A", "B", "AB", "O"], {
      message: "กรุณาเลือกหมู่เลือด",
    }),
    chronicDisease: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type LocalRegisterFormValues = z.infer<typeof registerSchema>;

function formatThaiDateWithBuddhistYear(date: Date) {
  return `${format(date, "d MMMM", { locale: th })} ${date.getFullYear() + 543}`;
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlThaiId = searchParams.get("thaiId");

  const [isLoading, setIsLoading] = useState(true);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [birthdateOpen, setBirthdateOpen] = useState(false);

  const { register: registerUserApi } = useRegister();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocalRegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      thaiId: urlThaiId || "",
      birthdate: "",
      gender: undefined,
      phoneNumber: "",
      bloodGroup: undefined,
      chronicDisease: "",
    },
  });

  const thaiIdValue = watch("thaiId");
  const birthdate = watch("birthdate");
  const birthdateValue = birthdate
    ? new Date(`${birthdate}T00:00:00`)
    : undefined;
  const birthdateLabel = birthdateValue
    ? `${formatThaiDateWithBuddhistYear(birthdateValue)} (อายุ ${differenceInYears(
        new Date(),
        birthdateValue
      )} ปี)`
    : null;

  useEffect(() => {
    const checkPatientData = async () => {
      if (!urlThaiId || urlThaiId.length !== 13) {
        toast.error(
          "ไม่พบข้อมูลรหัสบัตรประชาชน กรุณาทำรายการใหม่จากหน้าเข้าสู่ระบบ"
        );
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`/api/patient/check-id/${urlThaiId}`);
        if (!res.ok) {
          toast.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        if (data.exists && data.hasAccount) {
          toast.error(
            "รหัสบัตรประชาชนนี้ถูกลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ",
            { duration: 5000 }
          );
          router.replace("/login");
          return;
        }

        if (data.exists && data.patient) {
          setIsExistingPatient(true);
          setValue("firstName", data.patient.firstName);
          setValue("lastName", data.patient.lastName);
          setValue("birthdate", data.patient.birthdate);
          setValue("gender", data.patient.gender);
          setValue("phoneNumber", data.patient.phoneNumber);
          setValue("bloodGroup", data.patient.bloodGroup);
          setValue("chronicDisease", data.patient.chronicDisease || "");
          toast.success(
            "พบข้อมูลประวัติการรักษา กรุณาสร้างบัญชีผู้ใช้งาน"
          );
        } else {
          setIsExistingPatient(false);
        }
      } catch {
        toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
      } finally {
        setIsLoading(false);
      }
    };

    checkPatientData();
  }, [urlThaiId, router, setValue]);

  const onSubmit = async (data: LocalRegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUserApi(data);
      toast.success("ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ");
      router.replace("/login");
      router.refresh();
    } catch (e: unknown) {
      const errorMessage = handleException(
        e,
        "เกิดข้อผิดพลาดในการลงทะเบียน"
      );
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="animate-pulse text-muted-foreground">
            กำลังตรวจสอบข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4 py-8">
      <div className="w-full max-w-2xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            ลงทะเบียนผู้ป่วยใหม่
          </h1>
          <p className="text-sm text-muted-foreground">
            กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้งานระบบคลินิก TCM
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="border-b pb-2 text-lg font-semibold">ข้อมูลบัญชี</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  อีเมล <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="เช่น john@example.com"
                  disabled={isSubmitting}
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2" />

              <div className="space-y-2">
                <Label htmlFor="password">
                  รหัสผ่าน <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  disabled={isSubmitting}
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  ยืนยันรหัสผ่าน <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="border-b pb-2 text-lg font-semibold">
              ข้อมูลส่วนตัวผู้ป่วย
            </h2>

            {isExistingPatient && (
              <p className="rounded-md bg-green-50 p-2 text-sm text-green-600">
                ระบบพบฐานข้อมูลประวัติการรักษาของคุณแล้ว
                ข้อมูลด้านล่างจะถูกตั้งเป็นโหมดอ่านอย่างเดียว
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  ชื่อจริง <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="ชื่อ"
                  readOnly={isExistingPatient}
                  disabled={isSubmitting}
                  {...register("firstName")}
                  className={`${errors.firstName ? "border-destructive" : ""} ${
                    isExistingPatient ? "cursor-not-allowed bg-muted" : ""
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  นามสกุล <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="นามสกุล"
                  readOnly={isExistingPatient}
                  disabled={isSubmitting}
                  {...register("lastName")}
                  className={`${errors.lastName ? "border-destructive" : ""} ${
                    isExistingPatient ? "cursor-not-allowed bg-muted" : ""
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thaiId">
                  รหัสบัตรประชาชน (13 หลัก){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="thaiId"
                  placeholder="1-1111-11111-11-1"
                  maxLength={17}
                  readOnly={true}
                  disabled={true}
                  value={formatThaiId(thaiIdValue || "")}
                  {...register("thaiId")}
                  className={`cursor-not-allowed bg-muted ${
                    errors.thaiId ? "border-destructive" : ""
                  }`}
                />
                {errors.thaiId && (
                  <p className="text-xs text-destructive">
                    {errors.thaiId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">
                  วันเกิด <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="birthdate"
                  render={() => (
                    <Popover open={birthdateOpen} onOpenChange={setBirthdateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="birthdate"
                          type="button"
                          variant="outline"
                          disabled={isSubmitting || isExistingPatient}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !birthdateValue && "text-muted-foreground",
                            errors.birthdate && "border-destructive",
                            isExistingPatient && "cursor-not-allowed bg-muted"
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
                            setValue(
                              "birthdate",
                              date ? format(date, "yyyy-MM-dd") : "",
                              {
                                shouldValidate: true,
                                shouldDirty: true,
                              }
                            );
                            setBirthdateOpen(false);
                          }}
                          locale={th}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.birthdate && (
                  <p className="text-xs text-destructive">
                    {errors.birthdate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  เพศ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("gender")}
                  onValueChange={(val) =>
                    setValue("gender", val as "MALE" | "FEMALE", {
                      shouldValidate: true,
                    })
                  }
                  disabled={isSubmitting || isExistingPatient}
                >
                  <SelectTrigger
                    className={errors.gender ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="เลือกเพศ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">ชาย</SelectItem>
                    <SelectItem value="FEMALE">หญิง</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-xs text-destructive">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  เบอร์โทรศัพท์ <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <Input
                      id="phoneNumber"
                      placeholder="081-234-5678"
                      readOnly={isExistingPatient}
                      disabled={isSubmitting}
                      value={formatPhoneNumber(field.value || "")}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      className={`${errors.phoneNumber ? "border-destructive" : ""} ${
                        isExistingPatient ? "cursor-not-allowed bg-muted" : ""
                      }`}
                    />
                  )}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">
                  หมู่เลือด <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("bloodGroup")}
                  onValueChange={(val) =>
                    setValue("bloodGroup", val as "A" | "B" | "AB" | "O", {
                      shouldValidate: true,
                    })
                  }
                  disabled={isSubmitting || isExistingPatient}
                >
                  <SelectTrigger
                    className={errors.bloodGroup ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="เลือกหมู่เลือด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
                {errors.bloodGroup && (
                  <p className="text-xs text-destructive">
                    {errors.bloodGroup.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronicDisease">โรคประจำตัว (ถ้ามี)</Label>
                <Input
                  id="chronicDisease"
                  placeholder="เช่น เบาหวาน, ความดัน"
                  readOnly={isExistingPatient}
                  disabled={isSubmitting}
                  {...register("chronicDisease")}
                  className={isExistingPatient ? "cursor-not-allowed bg-muted" : ""}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.replace("/login")}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>

            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "ยืนยันการลงทะเบียน"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
