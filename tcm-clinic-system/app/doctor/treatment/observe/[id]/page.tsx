"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Addmedicine } from "@/components/add-medicine";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { TongueInput } from "@/components/custom/tongue-input";
import { TreatmentItemForm } from "@/components/custom/treatment-item-form";
import { useAddTreatmentItems } from "@/hooks/useAddTreatmentItems";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import {
  formatGender,
  getAge,
  usePatientDetail,
} from "@/hooks/usePatientDetail";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { useUpdateHealthProfile } from "@/hooks/useUpdateHealthProfile";
import axios from "axios";

const STAFF_ID = 1; // TODO: replace with useContext/session

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  IN_PROGRESS: { label: "กำลังดำเนินการ", cls: "bg-blue-50 text-blue-800" },
  COMPLETED: { label: "สำเร็จ", cls: "bg-emerald-50 text-emerald-800" },
};

const schema = z.object({
  tongue: z
    .object({
      color: z.string().optional(),
      coating: z.string().optional(),
      moisture: z.string().optional(),
      shape: z.string().optional(),
      cracks: z.boolean().optional(),
      toothMarks: z.boolean().optional(),
    })
    .optional(),
  treatmentItems: z
    .array(
      z.object({
        serviceId: z.number().int().positive("กรุณาเลือกบริการ"),
        roomId: z.number().int().positive("กรุณาเลือกห้อง"),
      }),
    )
    .min(1, "กรุณาเพิ่มบริการอย่างน้อย 1 รายการ"),
});

type FormValues = z.infer<typeof schema>;
type RoomOption = { value: number; label: string };
interface TxHistory {
  id: number;
  serviceName: string;
  roomName: string;
  date: string;
  startAt: string;
  endAt: string;
  status: string;
}

function StatItem({
  label,
  value,
  unit,
}: {
  label: string;
  value?: string | number | null;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">
        {value ?? "—"}
        {value != null && unit && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

const DoctorPatientPage = () => {
  const params = useParams();
  const router = useRouter();
  const treatmentId = Number(params.id);

  const [healthProfileId, setHealthProfileId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [history, setHistory] = useState<TxHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/treatment/${treatmentId}`)
      .then((r) => {
        const t = r.data;
        if (t) {
          setHealthProfileId(t.healthProfileId ?? null);
          setPatientId(t.patientId ?? null);
          setInvoiceId(t.invoiceId ?? null);
        }
      })
      .catch(() => {});

    axios
      .get("/api/room", {
        params: { limit: 100, page: 1, status: "AVAILABLE" },
      })
      .then((r) =>
        setRoomOptions(
          (r.data?.data || []).map((room: { id: number; name: string }) => ({
            value: room.id,
            label: room.name,
          })),
        ),
      )
      .catch(() => {});
  }, [treatmentId]);

  useEffect(() => {
    if (!patientId) return;
    setHistoryLoading(true);
    axios
      .get("/api/treatment/med-assist", {
        params: { page: 1, limit: 50, patientId },
      })
      .then((r) => setHistory(r.data?.data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [patientId]);

  const { profile, loading: profileLoading } = useHealthProfile(
    healthProfileId,
    true,
  );
  const { patient, loading: patientLoading } = usePatientDetail(patientId);
  const { update, loading: saving } = useUpdateHealthProfile();
  const { submit, loading: submitting } = useAddTreatmentItems();
  const { options: serviceOptions } = useServiceOptions("", 100, 1);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tongue: {
        color: undefined,
        coating: undefined,
        moisture: undefined,
        shape: undefined,
        cracks: false,
        toothMarks: false,
      },
      treatmentItems: [{ serviceId: 0, roomId: 0 }],
    },
  });
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "treatmentItems",
  });
  const selectedCoating = watch("tongue.coating");

  useEffect(() => {
    if (!profile) return;
    const v = profile.vitals as Record<string, unknown>;
    const t = (v?.tongue ?? {}) as Record<string, unknown>;
    methods.reset({
      ...methods.getValues(),
      tongue: {
        color: (t.color as string) ?? undefined,
        coating: (t.coating as string) ?? undefined,
        moisture: (t.moisture as string) ?? undefined,
        shape: (t.shape as string) ?? undefined,
        cracks: (t.cracks as boolean) ?? false,
        toothMarks: (t.toothMarks as boolean) ?? false,
      },
    });
  }, [profile]);

  const onSubmit = async (values: FormValues) => {
    if (!healthProfileId || !invoiceId || !patientId) {
      toast.error("ข้อมูลไม่ครบ ไม่สามารถบันทึกได้");
      return;
    }
    try {
      const existingVitals = (profile?.vitals ?? {}) as Record<string, unknown>;
      await update(healthProfileId, {
        vitals: {
          ...(existingVitals as object),
          tongue: values.tongue ?? null,
        } as never,
      });
      await submit({
        doctorId: STAFF_ID,
        patientId,
        healthProfileId,
        invoiceId,
        startAt: `${format(new Date(), "yyyy-MM-dd")}T${format(new Date(), "HH:mm")}:00`,
        treatmentItems: values.treatmentItems,
      });
      toast.success("บันทึกข้อมูลสำเร็จ");
      router.push("/doctor/treatment");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  };

  const vitals = profile?.vitals as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/doctor/treatment">
              คนไข้ของฉัน
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {patientLoading
                ? "กำลังโหลด..."
                : (patient?.fullName ?? "ข้อมูลคนไข้")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ── Patient Card ── */}
      {patientLoading ? (
        <Card>
          <CardContent className="pt-5">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : (
        patient && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{patient.fullName}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {patient.thaiId}
                  </p>
                </div>
                <Badge variant="outline" className="text-sm font-bold">
                  หมู่เลือด {patient.bloodGroup || "—"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatItem label="เพศ" value={formatGender(patient.gender)} />
                <StatItem label="อายุ" value={getAge(patient.birthdate)} />
                <StatItem label="เบอร์โทร" value={patient.phoneNumber} />
                <StatItem
                  label="โรคประจำตัว"
                  value={patient.chronicDisease || "ไม่มี"}
                />
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="examine">
        <TabsList className="w-full">
          <TabsTrigger value="examine" className="flex-1">
            ตรวจวินิจฉัย
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            ประวัติการรักษา
          </TabsTrigger>
        </TabsList>

        {/* Tab: ตรวจวินิจฉัย */}
        <TabsContent value="examine" className="space-y-4 mt-4">
          {profileLoading ? (
            <Card>
              <CardContent className="pt-4 space-y-3">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : (
            profile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">
                    Health Profile · บันทึก #{profile.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <StatItem
                      label="น้ำหนัก"
                      value={profile.weight}
                      unit="kg"
                    />
                    <StatItem
                      label="ส่วนสูง"
                      value={profile.height}
                      unit="cm"
                    />
                    <StatItem label="ความดัน" value={profile.bp} unit="mmHg" />
                  </div>
                  {vitals && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatItem
                          label="อุณหภูมิ"
                          value={vitals.temperature as number}
                          unit="°C"
                        />
                        <StatItem
                          label="ชีพจร"
                          value={vitals.pulse as number}
                          unit="bpm"
                        />
                        <StatItem
                          label="การหายใจ"
                          value={vitals.respiratoryRate as number}
                          unit="ครั้ง/นาที"
                        />
                        <StatItem
                          label="ออกซิเจน"
                          value={vitals.oxygenSaturation as number}
                          unit="%"
                        />
                      </div>
                    </>
                  )}
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">อาการ</p>
                    <p className="text-sm">{profile.symptoms || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* การตรวจลิ้น */}
              <TongueInput />

              {/* เพิ่มบริการ */}
              <TreatmentItemForm
                serviceOptions={serviceOptions}
                roomOptions={roomOptions}
              />
              <Addmedicine/>


              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={saving || submitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving || submitting ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Tab: ประวัติการรักษา */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ประวัติการรักษา</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>บริการ</TableHead>
                    <TableHead className="text-center">ห้อง</TableHead>
                    <TableHead className="text-center">วันที่</TableHead>
                    <TableHead className="text-center">เวลา</TableHead>
                    <TableHead className="text-center">สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {[0, 1, 2, 3, 4].map((j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        ไม่พบประวัติการรักษา
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => {
                      const s = STATUS_LABEL[h.status] ?? {
                        label: h.status,
                        cls: "",
                      };
                      return (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">
                            {h.serviceName}
                          </TableCell>
                          <TableCell className="text-center">
                            {h.roomName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-800"
                            >
                              {h.date
                                ? format(parseISO(h.date), "dd/MM/yyyy", {
                                    locale: th,
                                  })
                                : "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs text-muted-foreground whitespace-nowrap">
                            {h.startAt} – {h.endAt}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className={s.cls}>
                              {s.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorPatientPage;
