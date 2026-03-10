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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// สร้าง Validation Schema ด้วย Zod
const roomSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อห้อง"),
  status: z.string().min(1, "กรุณาเลือกสถานะ"),
});

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "เปิดใช้งาน" },
  { value: "UNAVAILABLE", label: "ปิดใช้งาน" },
];

const NewRoomPage = () => {
  const router = useRouter();
  const [isSave, setIsSave] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createRoom } = useRoom();

  // ประกาศใช้งาน React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isDirty },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      status: "AVAILABLE",
    },
  });

  const handleOpenDialog = async () => {
    // สั่งให้ Hook Form เช็ค require ทั้งหมด
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

  // ใช้ watch สำหรับดึงค่า status มาโชว์ใน Select (เนื่องจาก Select ไม่ใช่ native input)
  const currentStatus = watch("status");

  const breadcrumbItems = [
    { label: "จัดการห้อง", href: "/med-assist/room" },
    { label: "เพิ่มข้อมูลห้อง" },
  ];

  const onSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    try {
      await createRoom(data);
      toast.success("สร้างห้องสำเร็จ");
      router.push("/med-assist/room");
      router.refresh();
    } catch (e: unknown) {
      const errorMessage = handleException(e, "ไม่สามารถสร้างห้องได้");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <BreadcrumbCustom items={breadcrumbItems} />

      <h1 className="text-2xl font-bold tracking-tight">เพิ่มห้องใหม่</h1>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ชื่อห้อง */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อห้อง</Label>
            <Input
              id="name"
              placeholder="เช่น ห้องตรวจ 01, OR-101"
              {...register("name")} // ใช้ register แทนการเขียน onChange เอง
              className={errors.name ? "border-destructive" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* สถานะ */}
          <div className="space-y-2">
            <Label htmlFor="status">สถานะเริ่มต้น</Label>
            <Select
              value={currentStatus}
              onValueChange={(value) => setValue("status", value)}
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

        {/* Dialog สำหรับยกเลิก */}
        <ConfirmDialog
          open={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          title="ยืนยันการยกเลิก?"
          description="ข้อมูลที่คุณกรอกไว้จะสูญหายและไม่ได้รับการบันทึก"
          confirmText="ยืนยันยกเลิก"
          isDestructive={true} // สีแดง
          onConfirm={() => router.back()}
        />

        {/* Dialog สำหรับบันทึก */}
        <ConfirmDialog
          open={isSave}
          onOpenChange={setIsSave}
          title="ยืนยันบันทึกข้อมูล?"
          description={`คุณกำลังจะเพิ่มห้อง "${watch("name")}" เข้าสู่ระบบ`}
          confirmText="ยืนยันบันทึก"
          onConfirm={handleSubmit(onSubmit)} // สีปกติ
        />
      </div>
    </div>
  );
};

export default NewRoomPage;
