"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

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
import { useService } from "@/hooks/use-service";
import { ServiceFormValues } from "@/types/service";

const serviceSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อบริการ"),
  price: z.number().positive("กรุณากรอกราคาให้มากกว่า 0"),
  duration_minute: z
    .number()
    .int("กรุณากรอกระยะเวลาเป็นจำนวนเต็ม")
    .positive("กรุณากรอกระยะเวลาให้มากกว่า 0"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
});

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "เปิดใช้งาน" },
  { value: "UNAVAILABLE", label: "ปิดใช้งาน" },
];

const preventNegativeNumberInput = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  if (["-", "e", "E"].includes(e.key)) {
    e.preventDefault();
  }
};

const NewServicePage = () => {
  const router = useRouter();
  const [isSave, setIsSave] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createService } = useService();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isDirty },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      price: 0,
      duration_minute: 0,
      status: "AVAILABLE",
    },
  });

  const currentStatus = watch("status");

  const breadcrumbItems = [
    { label: "จัดการบริการ", href: "/med-assist/service" },
    { label: "เพิ่มข้อมูลบริการ" },
  ];

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

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      await createService(data);
      toast.success("สร้างบริการสำเร็จ");
      router.push("/med-assist/service");
      router.refresh();
    } catch (e: unknown) {
      const errorMessage = handleException(e, "ไม่สามารถสร้างบริการได้");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <BreadcrumbCustom items={breadcrumbItems} />

      <h1 className="text-2xl font-bold tracking-tight">เพิ่มบริการใหม่</h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อบริการ</Label>
            <Input
              id="name"
              placeholder="เช่น ฝังเข็ม, นวดทุยหนา"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">ราคา (บาท)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              onKeyDown={preventNegativeNumberInput}
              placeholder="เช่น 500"
              {...register("price", { valueAsNumber: true })}
              className={errors.price ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minute">ระยะเวลา (นาที)</Label>
            <Input
              id="duration_minute"
              type="number"
              min={1}
              step="1"
              onKeyDown={preventNegativeNumberInput}
              placeholder="เช่น 60"
              {...register("duration_minute", { valueAsNumber: true })}
              className={errors.duration_minute ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.duration_minute && (
              <p className="text-xs text-destructive">
                {errors.duration_minute.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">สถานะเริ่มต้น</Label>
            <Select
              value={currentStatus}
              onValueChange={(value) =>
                setValue("status", value, { shouldDirty: true, shouldValidate: true })
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
              <p className="text-xs text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancelClick}
            >
              ยกเลิก
            </Button>

            <Button
              type="button"
              className="flex-1"
              onClick={handleOpenDialog}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "บันทึกข้อมูล"
              )}
            </Button>
          </div>
        </form>

        <ConfirmDialog
          open={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          title="ยืนยันการยกเลิก?"
          description="ข้อมูลที่คุณกรอกไว้จะสูญหายและไม่ได้รับการบันทึก"
          confirmText="ยืนยันยกเลิก"
          isDestructive={true}
          onConfirm={() => router.back()}
        />

        <ConfirmDialog
          open={isSave}
          onOpenChange={setIsSave}
          title="ยืนยันบันทึกข้อมูล?"
          description={`คุณกำลังจะเพิ่มบริการ "${watch("name")}" เข้าสู่ระบบ`}
          confirmText="ยืนยันบันทึก"
          onConfirm={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default NewServicePage;
