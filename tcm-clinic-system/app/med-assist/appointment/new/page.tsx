"use client";

import { handleException } from "@/app/utils/handleException";
import { BreadcrumbCustom } from "@/components/ui/breadcrum-custom";
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
import { useDebounce } from "@/hooks/use-debounce";
import { useMedAssistAppointmentCreate } from "@/hooks/useMedAssistAppointmentCreate";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

const formSchema = z.object({
  patientId: z.number().int().positive("กรุณาเลือกคนไข้"),
  date: z.date({
    message: "กรุณาเลือกวันที่",
  }),
  time: z.string().min(1, "กรุณาเลือกเวลา"),
});

type FormValues = z.infer<typeof formSchema>;

type Option = { value: number; label: string };
type PatientOption = Option & { thaiId: string };
type PatientDetail = { id: number; fullName: string; thaiId: string };
type Slot = { time: string; isAvailable: boolean; reason?: string };

const NewMedAssistAppointmentPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdParam = searchParams.get("patientId");
  const patientIdFromQuery = patientIdParam ? Number(patientIdParam) : 0;
  const {
    fetchSlots,
    bookAppointment,
    loading: booking,
  } = useMedAssistAppointmentCreate();

  const [patientSearch, setPatientSearch] = useState("");
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(
    null,
  );
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const debouncedPatientSearch = useDebounce(patientSearch, 300);

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: 0,
      time: "",
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");
  const selectedPatientId = Number(watch("patientId") ?? 0);

  useEffect(() => {
    if (!Number.isInteger(patientIdFromQuery) || patientIdFromQuery <= 0) {
      return;
    }

    setValue("patientId", patientIdFromQuery, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [patientIdFromQuery, setValue]);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/treatment/med-assist/patient-options", {
          params: { search: debouncedPatientSearch, limit: 20 },
        });
        const nextOptions = (res.data?.data || []) as PatientOption[];

        setPatientOptions((prev) => {
          const preservedSelectedOption =
            prev.find((option) => option.value === selectedPatientId) ??
            (patientDetail
              ? {
                  value: patientDetail.id,
                  label: patientDetail.fullName,
                  thaiId: patientDetail.thaiId,
                }
              : null);

          if (
            preservedSelectedOption &&
            !nextOptions.some(
              (option) => option.value === preservedSelectedOption.value,
            )
          ) {
            return [preservedSelectedOption, ...nextOptions];
          }

          return nextOptions;
        });
      } catch {
        setPatientOptions([]);
      }
    };

    run();
  }, [debouncedPatientSearch, patientDetail, selectedPatientId]);

  useEffect(() => {
    if (!selectedPatientId || selectedPatientId <= 0) {
      setPatientDetail(null);
      return;
    }

    api
      .get(`/treatment/med-assist/patient/${selectedPatientId}`)
      .then((res) => setPatientDetail(res.data?.data || null))
      .catch(() => setPatientDetail(null));
  }, [selectedPatientId]);

  useEffect(() => {
    if (!patientDetail) return;

    setPatientOptions((prev) => {
      if (prev.some((option) => option.value === patientDetail.id)) {
        return prev;
      }

      return [
        {
          value: patientDetail.id,
          label: patientDetail.fullName,
          thaiId: patientDetail.thaiId,
        },
        ...prev,
      ];
    });
  }, [patientDetail]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setSlotsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetchSlots(dateStr);
        setAvailableSlots(res?.slots || []);

        const stillAvailable = res?.slots?.some(
          (slot: Slot) => slot.time === selectedTime && slot.isAvailable,
        );

        if (!stillAvailable) {
          setValue("time", "");
        }
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, fetchSlots, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      await bookAppointment({
        patientId: values.patientId,
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time,
      });

      toast.success("บันทึกการจองสำเร็จ");
      router.push("/med-assist/appointment");
      router.refresh();
    } catch (e: unknown) {
      toast.error(handleException(e, "ไม่สามารถบันทึกการจองได้"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <BreadcrumbCustom
        items={[
          { label: "จัดการการจองคิว", href: "/med-assist/appointment" },
          { label: "เพิ่มการจองคิวใหม่" },
        ]}
      />

      <h1 className="text-2xl font-bold tracking-tight">เพิ่มการจองคิวใหม่</h1>

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
                render={({ field }) => {
                  const currentPatientId = Number(field.value ?? 0);
                  const hasMatchingOption =
                    currentPatientId > 0
                      ? patientOptions.some(
                          (option) => option.value === currentPatientId,
                        )
                      : true;

                  return (
                    <Select
                      key={`${currentPatientId}-${hasMatchingOption ? "ready" : "pending"}-${patientOptions.length}`}
                      value={currentPatientId > 0 ? String(currentPatientId) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            currentPatientId > 0 && !hasMatchingOption
                              ? "กำลังโหลดข้อมูลคนไข้..."
                              : "เลือกคนไข้"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {patientOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label} | {option.thaiId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }}
              />
              {errors.patientId && (
                <p className="text-xs text-destructive">
                  {errors.patientId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">2) วันที่และเวลา</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 flex flex-col pt-1">
              <Label className="mb-1">วันที่</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          !field.value && "text-muted-foreground",
                          errors.date && "border-destructive",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: th })
                        ) : (
                          <span>เลือกวันที่ต้องการจอง</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        locale={th}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>เวลา</Label>
              {slotsLoading ? (
                <div className="flex h-10 items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังตรวจสอบคิว...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;

                    return (
                      <Button
                        key={slot.time}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        disabled={!slot.isAvailable}
                        onClick={() => setValue("time", slot.time)}
                        className={cn(
                          "h-10 text-sm",
                          !slot.isAvailable && "opacity-50 cursor-not-allowed",
                        )}
                        title={slot.reason}
                      >
                        {slot.time} น.
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-10 items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-muted-foreground">
                  {selectedDate
                    ? "ไม่พบเวลาที่ว่างในวันนี้"
                    : "กรุณาเลือกวันที่ก่อน"}
                </div>
              )}
              {errors.time && (
                <p className="text-xs text-destructive mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 max-w-[150px]"
            onClick={() => router.back()}
          >
            ยกเลิก
          </Button>
          <Button type="submit" className="flex-1" disabled={booking}>
            {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ยืนยันการบันทึกการจอง
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function NewMedAssistAppointmentPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl p-6" />}>
      <NewMedAssistAppointmentPageContent />
    </Suspense>
  );
}
