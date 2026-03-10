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
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { format } from "date-fns";
import { Clock3, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: { "Content-Type": "application/json" },
});

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || Number.isNaN(value)) return undefined;
  return value;
}, z.number().optional());

const formSchema = z.object({
  patientId: z.number().int().positive("กรุณาเลือกคนไข้"),
  doctorId: z.number().int().positive("กรุณาเลือกแพทย์"),
  roomId: z.number().int().positive("กรุณาเลือกห้อง"),
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
});

type FormValues = z.output<typeof formSchema>;
type FormValuesInput = z.input<typeof formSchema>;

type Option = { value: number; label: string };
type PatientOption = Option & { thaiId: string; bookingAt: string | null };
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
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return `${age} ปี`;
};

const formatGenderThai = (g: string) =>
  g === "MALE" ? "ชาย" : g === "FEMALE" ? "หญิง" : g || "-";

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
      roomId: 0,
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
    },
  });

  const selectedPatientId = watch("patientId");
  const startAt = watch("startAt");
  const selectedTime = useMemo(
    () => startAt || format(new Date(), "HH:mm"),
    [startAt],
  );

  // ── Fetch patient options ──
  useEffect(() => {
    api
      .get("/treatment/med-assist/patient-options", {
        params: { search: debouncedPatientSearch, limit: 20 },
      })
      .then((r) => setPatientOptions(r.data?.data || []))
      .catch(() => setPatientOptions([]));
  }, [debouncedPatientSearch]);

  // ── Fetch patient detail ──
  useEffect(() => {
    if (!selectedPatientId || selectedPatientId <= 0) {
      setPatientDetail(null);
      return;
    }
    api
      .get(`/treatment/med-assist/patient/${selectedPatientId}`)
      .then((r) => setPatientDetail(r.data?.data || null))
      .catch(() => setPatientDetail(null));
  }, [selectedPatientId]);

  // ── Fetch doctor options (by time) ──
  useEffect(() => {
    api
      .get("/treatment/med-assist/doctor-options", {
        params: { time: selectedTime },
      })
      .then((r) => setDoctorOptions(r.data?.data || []))
      .catch(() => setDoctorOptions([]));
  }, [selectedTime]);

  // ── Fetch room options ──
  useEffect(() => {
    api
      .get("/room", { params: { limit: 100, page: 1, status: "AVAILABLE" } })
      .then((r) =>
        setRoomOptions(
          (r.data?.data || []).map((room: { id: number; name: string }) => ({
            value: room.id,
            label: room.name,
          })),
        ),
      )
      .catch(() => setRoomOptions([]));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await api.post("/treatment/med-assist", {
        patientId: values.patientId,
        doctorId: values.doctorId,
        roomId: values.roomId,
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
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <BreadcrumbCustom
        items={[
          { label: "การบำบัด", href: "/med-assist/treatment" },
          { label: "เพิ่มข้อมูลการบำบัด" },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight">เพิ่มการบำบัดใหม่</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── 1) เลือกคนไข้ ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1) เลือกคนไข้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>ค้นหาคนไข้ (ชื่อ / Thai ID)</Label>
                <Input
                  placeholder="พิมพ์ชื่อหรือเลขบัตรประชาชน"
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
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกคนไข้" />
                      </SelectTrigger>
                      <SelectContent>
                        {patientOptions.map((o) => (
                          <SelectItem key={o.value} value={String(o.value)}>
                            {o.label} | {o.thaiId}
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

            {/* Patient detail card */}
            {patientDetail && (
              <Card className="border-dashed bg-muted/30">
                <CardContent className="pt-4">
                  <div className="grid gap-2 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        ชื่อ-นามสกุล
                      </p>
                      <p className="font-medium">{patientDetail.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        เลขบัตรประชาชน
                      </p>
                      <p className="font-medium">{patientDetail.thaiId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">อายุ</p>
                      <p className="font-medium">
                        {getAge(patientDetail.birthdate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">เพศ</p>
                      <p className="font-medium">
                        {formatGenderThai(patientDetail.gender)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        กรุ๊ปเลือด
                      </p>
                      <p className="font-medium">{patientDetail.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        โรคประจำตัว
                      </p>
                      <p className="font-medium">
                        {patientDetail.chronicDisease || "ไม่มีข้อมูล"}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-xs text-muted-foreground">
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
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* ── 2) Health Profile ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2) กรอก Health Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>น้ำหนัก (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("healthProfile.weight", { valueAsNumber: true })}
                />
                {errors.healthProfile?.weight && (
                  <p className="text-xs text-destructive">
                    {errors.healthProfile.weight.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>ส่วนสูง (cm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("healthProfile.height", { valueAsNumber: true })}
                />
                {errors.healthProfile?.height && (
                  <p className="text-xs text-destructive">
                    {errors.healthProfile.height.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>ความดันโลหิต (mmHg)</Label>
                <Input
                  type="number"
                  {...register("healthProfile.bp", { valueAsNumber: true })}
                />
                {errors.healthProfile?.bp && (
                  <p className="text-xs text-destructive">
                    {errors.healthProfile.bp.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>อุณหภูมิ (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  {...register("healthProfile.temperature", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>ชีพจร (ครั้ง/นาที)</Label>
                <Input
                  type="number"
                  {...register("healthProfile.pulse", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>อัตราการหายใจ (ครั้ง/นาที)</Label>
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
              {errors.healthProfile?.symptoms && (
                <p className="text-xs text-destructive">
                  {errors.healthProfile.symptoms.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── 3) แพทย์ + เวลา ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3) เลือกแพทย์และเวลา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                              onValueChange={(h) =>
                                field.onChange(`${h}:${minute}`)
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
                              onValueChange={(m) =>
                                field.onChange(`${hour}:${m}`)
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
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกแพทย์" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorOptions.map((o) => (
                          <SelectItem key={o.value} value={String(o.value)}>
                            {o.label}
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
          </CardContent>
        </Card>

        {/* ── 4) บริการ + ห้อง ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4) บริการและห้อง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Locked service */}
            <div className="space-y-2">
              <Label>บริการ</Label>
              <div className="flex h-10 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>ตรวจวินิจฉัย (Initial Consultation)</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  กำหนดโดยระบบ
                </Badge>
              </div>
            </div>

            {/* Room select */}
            <div className="space-y-2">
              <Label>ห้อง</Label>
              <Controller
                control={control}
                name="roomId"
                render={({ field }) => (
                  <Select
                    value={field.value > 0 ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกห้อง" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomOptions.map((o) => (
                        <SelectItem key={o.value} value={String(o.value)}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.roomId && (
                <p className="text-xs text-destructive">
                  {errors.roomId.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
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
