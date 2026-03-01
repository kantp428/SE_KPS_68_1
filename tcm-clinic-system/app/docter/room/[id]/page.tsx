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
import { useRoom } from "@/hooks/useRoom";
import { RoomFormValues } from "@/types/room";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const roomSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อห้อง"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
});

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "เปิดใช้งาน" },
  { value: "UNAVAILABLE", label: "ปิดใช้งาน" },
];

const EditRoomPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [isSave, setIsSave] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { fetchOne, updateRoom } = useRoom();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
  });

  useEffect(() => {
    const initData = async () => {
      if (!id) return;
      try {
        setIsInitialLoading(true);
        const data = await fetchOne(id);
        console.log(data);
        reset({
          name: data.name,
          status: data.status,
        });
      } catch (e) {
        toast.error("ไม่พบข้อมูลห้อง หรือเกิดข้อผิดพลาด");
        router.push("/staff/room");
      } finally {
        setIsInitialLoading(false);
      }
    };
    initData();
  }, [id]);

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
    { label: "จัดการห้อง", href: "/staff/room" },
    { label: `แก้ไขข้อมูลห้อง [${id}]` },
  ];

  const onSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    try {
      await updateRoom(id, data);
      toast.success("แก้ไขข้อมูลสำเร็จ");
      router.push("/staff/room");
      router.refresh();
    } catch (e: unknown) {
      const errorMessage = handleException(e, "ไม่สามารถแก้ไขข้อมูลได้");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // แสดง Loading ระหว่างรอข้อมูลจาก API ครั้งแรก
  if (isInitialLoading) {
    return (
      <div className="flex h-100 flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">กำลังโหลดข้อมูลห้อง...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <BreadcrumbCustom items={breadcrumbItems} />

      <h1 className="text-2xl font-bold tracking-tight">แก้ไขข้อมูลห้อง</h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form className="space-y-4">
          {/* ชื่อห้อง */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อห้อง</Label>
            <Input
              id="name"
              placeholder="กรอกชื่อห้อง"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* สถานะ */}
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
          description={`คุณกำลังจะเปลี่ยนข้อมูลห้องเป็น "${watch("name")}"`}
          confirmText="ยืนยันบันทึก"
          onConfirm={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};

export default EditRoomPage;
