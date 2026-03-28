"use client";

import { handleException } from "@/app/utils/handleException";
import { BreadcrumbCustom } from "@/components/ui/breadcrum-custom";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMedicine } from "@/hooks/useMedicine";
import { MedicineFormValues } from "@/types/medicine";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const medicineSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อยา"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "ราคาต้องมากกว่าหรือเท่ากับ 0"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
});

type MedicineFormSchema = z.input<typeof medicineSchema>;

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "เปิดใช้งาน" },
  { value: "UNAVAILABLE", label: "ปิดใช้งาน" },
];

const EditMedicinePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isSave, setIsSave] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { fetchOne, updateMedicine } = useMedicine();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<MedicineFormSchema>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      status: "AVAILABLE",
    },
  });

  useEffect(() => {
    const initData = async () => {
      if (!id) {
        return;
      }

      try {
        setIsInitialLoading(true);
        const data = await fetchOne(id);
        reset({
          name: data.name,
          description: data.description ?? "",
          price: Number(data.price),
          status: data.status,
        });
      } catch {
        toast.error("ไม่พบข้อมูลยา หรือเกิดข้อผิดพลาด");
        router.push("/med-assist/medicine");
      } finally {
        setIsInitialLoading(false);
      }
    };

    initData();
  }, [id, reset, router]);

  const handleOpenDialog = async () => {
    const isValid = await trigger();
    if (isValid) {
      setIsSave(true);
    } else {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setIsCancelOpen(true);
    } else {
      router.back();
    }
  };

  const currentStatus = watch("status");

  const breadcrumbItems = [
    { label: "จัดการยา", href: "/med-assist/medicine" },
    { label: `แก้ไขข้อมูลยา [${id}]` },
  ];

  const onSubmit = async (data: MedicineFormSchema) => {
    setIsSubmitting(true);
    try {
      const payload: MedicineFormValues = {
        name: data.name,
        description: data.description ?? undefined,
        price: Number(data.price),
        status: data.status,
      };

      await updateMedicine(id, payload);
      toast.success("แก้ไขข้อมูลสำเร็จ");
      router.push("/med-assist/medicine");
      router.refresh();
    } catch (e: unknown) {
      const errorMessage = handleException(e, "ไม่สามารถแก้ไขข้อมูลได้");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-100 flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูลยา...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <BreadcrumbCustom items={breadcrumbItems} />

      <h1 className="text-2xl font-bold tracking-tight">แก้ไขข้อมูลยา</h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อยา</Label>
            <Input
              id="name"
              placeholder="กรอกชื่อยา"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">คำอธิบาย</Label>
            <Textarea
              id="description"
              placeholder="กรอกคำอธิบายหรือสรรพคุณยา"
              rows={3}
              {...register("description")}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">ราคา (บาท)</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                {...register("price")}
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select
                value={currentStatus}
                onValueChange={(value) =>
                  setValue("status", value, { shouldDirty: true })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={errors.status ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancelClick}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              className="flex-1"
              onClick={handleOpenDialog}
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "บันทึกการแก้ไข"
              )}
            </Button>
          </div>
        </form>

        <ConfirmDialog
          open={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          title="ยืนยันการยกเลิก?"
          description="การเปลี่ยนแปลงที่คุณแก้ไขจะสูญหาย"
          confirmText="ยืนยันยกเลิก"
          isDestructive={true}
          onConfirm={() => router.back()}
        />

        <ConfirmDialog
          open={isSave}
          onOpenChange={setIsSave}
          title="ยืนยันบันทึกการแก้ไข?"
          description={`คุณกำลังจะเปลี่ยนข้อมูลยาเป็น "${watch("name")}"`}
          confirmText="ยืนยันบันทึก"
          onConfirm={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default EditMedicinePage;
