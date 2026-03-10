"use client";
import { handleException } from "@/app/utils/handleException";
import { BreadcrumbCustom } from "@/components/ui/breadcrum-custom";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // เพิ่ม Textarea สำหรับ Description
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  price: z.coerce.number().min(0, "ราคามันต้องมากกว่าหรือเท่ากับ 0"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
});

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "เปิดใช้งาน" },
  { value: "UNAVAILABLE", label: "ปิดใช้งาน" },
];

const EditMedicinePage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const isEdit = !!id;

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(isEdit);

  const { fetchOne, updateMedicine, createMedicine } = useMedicine();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: { status: "AVAILABLE", price: 0 },
  });

  useEffect(() => {
    if (isEdit) {
      const initData = async () => {
        try {
          const data = await fetchOne(id);
          reset(data);
        } catch (e) {
          toast.error("ไม่พบข้อมูลยา");
          router.push("/staff/medicine");
        } finally {
          setIsInitialLoading(false);
        }
      };
      initData();
    }
  }, [id, isEdit]);

  const onSubmit = async (data: MedicineFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateMedicine(id, data);
        toast.success("แก้ไขข้อมูลสำเร็จ");
      } else {
        await createMedicine(data);
        toast.success("เพิ่มข้อมูลยาสำเร็จ");
      }
      router.push("/staff/medicine");
      router.refresh();
    } catch (e) {
      toast.error(handleException(e, "ไม่สามารถบันทึกข้อมูลได้"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading)
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p>กำลังโหลดข้อมูลยา...</p>
      </div>
    );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <BreadcrumbCustom
        items={[
          { label: "จัดการยา", href: "/staff/medicine" },
          { label: isEdit ? `แก้ไขข้อมูลยา [${id}]` : "เพิ่มยาใหม่" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        {isEdit ? "แก้ไขข้อมูลยา" : "เพิ่มยาใหม่"}
      </h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label>ชื่อยา</Label>
            <Input
              {...register("name")}
              placeholder="กรอกชื่อยา"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>คำอธิบาย (สรรพคุณ)</Label>
            <Textarea
              {...register("description")}
              placeholder="กรอกคำอธิบายหรือสรรพคุณยา"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ราคา (บาท)</Label>
              <Input type="number" {...register("price")} placeholder="0.00" />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v, { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => (isDirty ? setIsCancelOpen(true) : router.back())}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-1"
              onClick={async () =>
                (await trigger())
                  ? setIsSaveOpen(true)
                  : toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
              }
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "บันทึกข้อมูล"
              )}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        title="ยกเลิก?"
        description="ข้อมูลที่แก้ไขจะสูญหาย"
        confirmText="ยืนยัน"
        onConfirm={() => router.back()}
      />
      <ConfirmDialog
        open={isSaveOpen}
        onOpenChange={setIsSaveOpen}
        description=""
        title="บันทึกข้อมูล?"
        confirmText="ยืนยัน"
        onConfirm={handleSubmit(onSubmit)}
      />
    </div>
  );
};

export default EditMedicinePage;
