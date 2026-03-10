"use client";

import { handleException } from "@/app/utils/handleException";
import { BreadcrumbCustom } from "@/components/ui/breadcrum-custom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useDebounce } from "@/hooks/use-debounce";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { format } from "date-fns";
import { Clock3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || Number.isNaN(value)) {
    return undefined;
  }
  return value;
}, z.number().optional());

const formSchema = z.object({
  patientId: z.number().int().positive("กรุณาเลือกคนไข้"),
  doctorId: z.number().int().positive("กรุณาเลือกแพทย์"),
  startAt: z.string().min(1, "กรุณาเลือกเวลาเริ่ม"),
  healthProfile: z.object({
    weight: z.number().positive("น้ำหนักต้องมากกว่า 0"),
    height: z.number().positive("ส่วนสูงต้องมากกว่า 0"),
    bp: z.number().int().positive("ความดันต้องมากกว่า 0"),
    symptoms: z.string().min(1, "กรุณากรอกอาการ"),
    temperature: optionalNumber,
    pulse: optionalNumber,
    respiratoryRate: optionalNumber,
    oxygenSaturation: optionalNumber,
  }),
  treatmentItems: z
    .array(
      z.object({
        serviceId: z.number().int().positive("กรุณาเลือกบริการ"),
        roomId: z.number().int().positive("กรุณาเลือกห้อง"),
      }),
    )
    .min(1, "กรุณาเพิ่มรายการอย่างน้อย 1 รายการ"),
});

type FormValues = z.output<typeof formSchema>;
type FormValuesInput = z.input<typeof formSchema>;

type Option = { value: number; label: string };

type PatientOption = Option & {
  thaiId: string;
  bookingAt: string | null;
};

type PatientDetail = {
  id: number;
  fullName: string;
  thaiId: string;
  phoneNumber: string;
  birthdate: string;
  gender: string;
  bloodGroup: string;
  chronicDisease: string | null;
  bookingAt: string | null;
};

const getAge = (birthdate: string) => {
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return `${age} ปี`;
};

const formatGenderThai = (gender: string) => {
  if (gender === "MALE") return "ชาย";
  if (gender === "FEMALE") return "หญิง";
  return gender || "-";
};

const hourOptions = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const minuteOptions = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

const NewTreatmentPage = () => {
  const router = useRouter();

  const [patientSearch, setPatientSearch] = useState("");
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(
    null,
  );
  const [doctorOptions, setDoctorOptions] = useState<Option[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Option[]>([]);
  const [roomOptions, setRoomOptions] = useState<Option[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const debouncedPatientSearch = useDebounce(patientSearch, 300);

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValuesInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      startAt: format(new Date(), "HH:mm"),
      healthProfile: {
        weight: undefined,
        height: undefined,
        bp: undefined,
        symptoms: "",
        temperature: undefined,
        pulse: undefined,
        respiratoryRate: undefined,
        oxygenSaturation: undefined,
      },
      treatmentItems: [{ serviceId: 0, roomId: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatmentItems",
  });

  const selectedPatientId = watch("patientId");
  const startAt = watch("startAt");

  const selectedTime = useMemo(() => {
    if (!startAt) return format(new Date(), "HH:mm");
    return startAt;
  }, [startAt]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/treatment/med-assist/patient-options", {
          params: { search: debouncedPatientSearch, limit: 20 },
        });
        setPatientOptions(res.data?.data || []);
      } catch {
        setPatientOptions([]);
      }
    };
    run();
  }, [debouncedPatientSearch]);

  useEffect(() => {
    const run = async () => {
      if (!selectedPatientId || selectedPatientId <= 0) {
        setPatientDetail(null);
        return;
      }
      try {
        const res = await api.get(
          `/treatment/med-assist/patient/${selectedPatientId}`,
        );
        setPatientDetail(res.data?.data || null);
      } catch {
        setPatientDetail(null);
      }
    };
    run();
  }, [selectedPatientId]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/treatment/med-assist/doctor-options", {
          params: { time: selectedTime },
        });
        setDoctorOptions(res.data?.data || []);
      } catch {
        setDoctorOptions([]);
      }
    };
    run();
  }, [selectedTime]);

  useEffect(() => {
    const run = async () => {
      try {
        const [serviceRes, roomRes] = await Promise.all([
          api.get("/service/options", { params: { limit: 100, page: 1 } }),
          api.get("/room", {
            params: { limit: 100, page: 1, status: "AVAILABLE" },
          }),
        ]);
        setServiceOptions(serviceRes.data?.data || []);
        setRoomOptions(
          (roomRes.data?.data || []).map(
            (room: { id: number; name: string }) => ({
              value: room.id,
              label: room.name,
            }),
          ),
        );
      } catch {
        setServiceOptions([]);
        setRoomOptions([]);
      }
    };
    run();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await api.post("/treatment/med-assist", {
        patientId: values.patientId,
        doctorId: values.doctorId,
        startAt: `${format(new Date(), "yyyy-MM-dd")}T${values.startAt}:00`,
        healthProfile: {
          weight: values.healthProfile.weight,
          height: values.healthProfile.height,
          bp: values.healthProfile.bp,
          symptoms: values.healthProfile.symptoms,
          vitals: {
            temperature: values.healthProfile.temperature ?? null,
            pulse: values.healthProfile.pulse ?? null,
            respiratoryRate: values.healthProfile.respiratoryRate ?? null,
            oxygenSaturation: values.healthProfile.oxygenSaturation ?? null,
          },
        },
        treatmentItems: values.treatmentItems,
      });

      toast.success("สร้างข้อมูลการบำบัดสำเร็จ");
      router.push("/med-assist/treatment");
      router.refresh();
    } catch (e: unknown) {
      toast.error(handleException(e, "ไม่สามารถสร้างข้อมูลการบำบัดได้"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <BreadcrumbCustom
        items={[
          { label: "การบำบัด", href: "/med-assist/treatment" },
          { label: "เพิ่มข้อมูลการบำบัด" },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight">เพิ่มการบำบัดใหม่</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">1) เลือกคนไข้</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>ค้นหาคนไข้ (ชื่อ / Thai ID)</Label>
              <Input
                placeholder="พิมพ์ชื่อหรือเลขบัตรประชาชน"
                className="h-10"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>คนไข้</Label>
              <Controller
                control={control}
                name="patientId"
                render={({ field }) => (
                  <Select
                    value={field.value > 0 ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full max-w-full overflow-hidden">
                      <SelectValue
                        placeholder="เลือกคนไข้"
                        className="block max-w-[calc(100vw-8rem)] truncate text-left"
                      />
                    </SelectTrigger>
                    <SelectContent className="max-w-[calc(100vw-2rem)]">
                      {patientOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                          className="whitespace-normal wrap-break-word"
                        >
                          {option.label} | {option.thaiId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.patientId && (
                <p className="text-xs text-destructive">
                  {errors.patientId.message}
                </p>
              )}
            </div>
          </div>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">2) ข้อมูลคนไข้</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {patientDetail ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">
                      ชื่อ-นามสกุล
                    </p>
                    <p className="font-medium">{patientDetail.fullName}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">
                      เลขบัตรประชาชน
                    </p>
                    <p className="font-medium">{patientDetail.thaiId}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">เพศ</p>
                    <p className="font-medium">
                      {formatGenderThai(patientDetail.gender)}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">อายุ</p>
                    <p className="font-medium">
                      {getAge(patientDetail.birthdate)}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">กรุ๊ปเลือด</p>
                    <p className="font-medium">{patientDetail.bloodGroup}</p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="text-muted-foreground text-xs">โรคประจำตัว</p>
                    <p className="font-medium">
                      {patientDetail.chronicDisease || "ไม่มีข้อมูล"}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/40 p-3 md:col-span-2">
                    <p className="text-muted-foreground text-xs">
                      การจองวันนี้
                    </p>
                    <p className="font-medium">
                      {patientDetail.bookingAt
                        ? format(
                            new Date(patientDetail.bookingAt),
                            "dd/MM/yyyy HH:mm",
                          )
                        : "ไม่มีการจอง"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">ยังไม่ได้เลือกคนไข้</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">3) กรอก Health Profile ใหม่</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>น้ำหนัก (kg)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("healthProfile.weight", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>ส่วนสูง (cm)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("healthProfile.height", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>BP</Label>
              <Input
                type="number"
                {...register("healthProfile.bp", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>อุณหภูมิ</Label>
              <Input
                type="number"
                step="0.1"
                {...register("healthProfile.temperature", {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>ชีพจร</Label>
              <Input
                type="number"
                {...register("healthProfile.pulse", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>อัตราการหายใจ</Label>
              <Input
                type="number"
                {...register("healthProfile.respiratoryRate", {
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>อาการ</Label>
            <Input
              {...register("healthProfile.symptoms")}
              placeholder="กรอกอาการของผู้ป่วย"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">4) เลือกแพทย์จากตารางงาน</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>เวลาเริ่ม</Label>
              <Controller
                control={control}
                name="startAt"
                render={({ field }) => {
                  const [hour = "00", minute = "00"] = (
                    field.value || "00:00"
                  ).split(":");
                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start font-normal"
                        >
                          <Clock3 className="mr-2 h-4 w-4" />
                          {field.value || "เลือกเวลา"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <div className="flex items-center gap-2">
                          <Select
                            value={hour}
                            onValueChange={(nextHour) =>
                              field.onChange(`${nextHour}:${minute}`)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                              {hourOptions.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground text-sm">
                            :
                          </span>
                          <Select
                            value={minute}
                            onValueChange={(nextMinute) =>
                              field.onChange(`${hour}:${nextMinute}`)
                            }
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {minuteOptions.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
              {errors.startAt && (
                <p className="text-xs text-destructive">
                  {errors.startAt.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>แพทย์</Label>
              <Controller
                control={control}
                name="doctorId"
                render={({ field }) => (
                  <Select
                    value={field.value > 0 ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกแพทย์" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctorId && (
                <p className="text-xs text-destructive">
                  {errors.doctorId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">5) เลือกหลายบริการและห้อง</h2>

          <div className="space-y-3">
            {fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="grid items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <div className="space-y-2">
                  <Label>บริการ #{index + 1}</Label>
                  <Controller
                    control={control}
                    name={`treatmentItems.${index}.serviceId`}
                    render={({ field }) => (
                      <Select
                        value={field.value > 0 ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกบริการ" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ห้อง #{index + 1}</Label>
                  <Controller
                    control={control}
                    name={`treatmentItems.${index}.roomId`}
                    render={({ field }) => (
                      <Select
                        value={field.value > 0 ? String(field.value) : ""}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกห้อง" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => append({ serviceId: 0, roomId: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" /> เพิ่มบริการ + ห้อง
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            ยกเลิก
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูลการบำบัด"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTreatmentPage;
