"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Addmedicine } from "@/components/add-medicine";
import { TongueInput } from "@/components/custom/tongue-input";
import { TreatmentItemForm } from "@/components/custom/treatment-item-form";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddMedicineItems } from "@/hooks/useAddMedicineItems";
import { useAddTreatmentItems } from "@/hooks/useAddTreatmentItems";
import { useCompleteTreatment } from "@/hooks/useCompleteTreatment";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import {
  formatGender,
  getAge,
  usePatientDetail,
} from "@/hooks/usePatientDetail";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { useUpdateHealthProfile } from "@/hooks/useUpdateHealthProfile";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  IN_PROGRESS: {
    label: "กำลังดำเนินการ",
    cls: "bg-blue-50 text-blue-800",
  },
  COMPLETED: {
    label: "สำเร็จ",
    cls: "bg-emerald-50 text-emerald-800",
  },
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
    .optional(),
  medicineItems: z
    .array(
      z.object({
        medId: z.number().int().positive("กรุณาเลือกยา"),
        quantity: z.number().int().positive("กรุณาระบุจำนวน"),
      }),
    )
    .optional(),
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
        {value ?? "-"}
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
  const auth = useAuth();
  const staffId = auth.user?.staff?.id;
  const params = useParams();
  const router = useRouter();
  const treatmentId = Number(params.id);

  const [healthProfileId, setHealthProfileId] = useState<number | null>(null);
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [history, setHistory] = useState<TxHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  useEffect(() => {
    axios
      .get(`/api/treatment/${treatmentId}`)
      .then((response) => {
        const treatment = response.data;
        if (treatment) {
          setHealthProfileId(treatment.healthProfileId ?? null);
          setPatientId(treatment.patientId ?? null);
          setInvoiceId(treatment.invoiceId ?? null);
        }
      })
      .catch(() => {});

    axios
      .get("/api/room", {
        params: { limit: 100, page: 1, status: "AVAILABLE" },
      })
      .then((response) =>
        setRoomOptions(
          (response.data?.data || []).map(
            (room: { id: number; name: string }) => ({
              value: room.id,
              label: room.name,
            }),
          ),
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
      .then((response) => setHistory(response.data?.data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [patientId]);

  const { profile, loading: profileLoading } = useHealthProfile(
    healthProfileId,
    true,
  );
  const { patient, loading: patientLoading } = usePatientDetail(patientId);
  const { update, loading: saving } = useUpdateHealthProfile();
  const { complete, loading: completeSaving } = useCompleteTreatment();
  const { submit: submitTreatmentItems, loading: treatmentItemsSaving } =
    useAddTreatmentItems();
  const { submit: submitMedicineItems, loading: medicineItemsSaving } =
    useAddMedicineItems();
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
      treatmentItems: [],
      medicineItems: [],
    },
  });
  const { getValues, handleSubmit, reset } = methods;

  useEffect(() => {
    if (!profile) return;

    const vitals = profile.vitals as Record<string, unknown>;
    const tongue = (vitals?.tongue ?? {}) as Record<string, unknown>;

    reset({
      ...getValues(),
      tongue: {
        color: (tongue.color as string) ?? undefined,
        coating: (tongue.coating as string) ?? undefined,
        moisture: (tongue.moisture as string) ?? undefined,
        shape: (tongue.shape as string) ?? undefined,
        cracks: (tongue.cracks as boolean) ?? false,
        toothMarks: (tongue.toothMarks as boolean) ?? false,
      },
    });
  }, [getValues, profile, reset]);

  const saveTreatment = async (values: FormValues) => {
    if (!healthProfileId || !invoiceId || !patientId) {
      toast.error("ข้อมูลไม่ครบ ไม่สามารถบันทึกได้");
      return;
    }

    const existingVitals = (profile?.vitals ?? {}) as Record<string, unknown>;

    try {
      await update(healthProfileId, {
        vitals: {
          ...(existingVitals as object),
          tongue: values.tongue ?? null,
        } as never,
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "ไม่สามารถบันทึกข้อมูลลิ้นได้",
      );
      return;
    }

    if (values.medicineItems?.length) {
      try {
        await submitMedicineItems({
          invoiceId,
          items: values.medicineItems,
        });
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "ไม่สามารถบันทึกการจ่ายยาได้",
        );
        return;
      }
    }

    if (values.treatmentItems?.length) {
      try {
        await submitTreatmentItems({
          doctorId: staffId!,
          patientId,
          healthProfileId,
          invoiceId,
          startAt: `${format(new Date(), "yyyy-MM-dd")}T${format(new Date(), "HH:mm")}:00`,
          treatmentItems: values.treatmentItems,
        });
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "ไม่สามารถบันทึกรายการรักษาได้",
        );
        return;
      }
    }

    try {
      await complete(treatmentId);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "ไม่สามารถอัปเดตสถานะการรักษาได้",
      );
      return;
    }

    toast.success("บันทึกข้อมูลสำเร็จ");
    router.push("/doctor/treatment");
    router.refresh();
  };

  const vitals = profile?.vitals as Record<string, unknown> | undefined;

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingValues) return;

    await saveTreatment(pendingValues);
    setPendingValues(null);
    setConfirmOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
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
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {patient.thaiId}
                  </p>
                </div>
                <Badge variant="outline" className="text-sm font-bold">
                  หมู่เลือด {patient.bloodGroup || "-"}
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

      <Tabs defaultValue="examine">
        <TabsList className="w-full">
          <TabsTrigger value="examine" className="flex-1">
            ตรวจวินิจฉัย
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            ประวัติการรักษา
          </TabsTrigger>
        </TabsList>

        <TabsContent value="examine" className="mt-4 space-y-4">
          {profileLoading ? (
            <Card>
              <CardContent className="space-y-3 pt-4">
                {[0, 1].map((index) => (
                  <Skeleton key={index} className="h-10 w-full" />
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
                    <p className="mb-1 text-xs text-muted-foreground">อาการ</p>
                    <p className="text-sm">{profile.symptoms || "-"}</p>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TongueInput />
              <TreatmentItemForm
                serviceOptions={serviceOptions}
                roomOptions={roomOptions}
              />
              <Addmedicine />

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
                  disabled={
                    saving ||
                    completeSaving ||
                    treatmentItemsSaving ||
                    medicineItemsSaving
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ||
                  completeSaving ||
                  treatmentItemsSaving ||
                  medicineItemsSaving
                    ? "กำลังบันทึก..."
                    : "บันทึก"}
                </Button>
              </div>
            </form>
          </FormProvider>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="ยืนยันการบันทึก"
            description="ต้องการบันทึกข้อมูลการรักษานี้ใช่หรือไม่"
            onConfirm={handleConfirmSave}
            cancelText="ยกเลิก"
            confirmText="บันทึก"
          />
        </TabsContent>

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
                    Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={index}>
                        {[0, 1, 2, 3, 4].map((cell) => (
                          <TableCell key={cell}>
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
                    history.map((item) => {
                      const status = STATUS_LABEL[item.status] ?? {
                        label: item.status,
                        cls: "",
                      };

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.serviceName}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.roomName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-800"
                            >
                              {item.date
                                ? format(parseISO(item.date), "dd/MM/yyyy", {
                                    locale: th,
                                  })
                                : "-"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-center text-xs text-muted-foreground">
                            {item.startAt} - {item.endAt}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className={status.cls}>
                              {status.label}
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
