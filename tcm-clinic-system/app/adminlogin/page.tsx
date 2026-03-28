"use client";

import { handleException } from "@/app/utils/handleException";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

const adminLoginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้งาน หรือ อีเมล"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setIsSubmitting(true);
    try {
      const isEmail = data.username.includes("@");

      const res = await login({
        ...(isEmail ? { email: data.username } : { username: data.username }),
        password: data.password,
        isAdminLogin: true,
      });

      toast.success("เข้าสู่ระบบเจ้าหน้าที่สำเร็จ");

      // Redirect based on role
      if (res.staffRole === "DOCTOR") {
        router.push("/doctor");
      } else if (res.staffRole === "MED_ASSISTANT") {
        router.push("/med-assist");
      } else {
        router.push("/"); // fallback
      }

      router.refresh();
    } catch (e: unknown) {
      const errorMessage = handleException(
        e,
        "ข้อมูลประจำตัวไม่ถูกต้อง หรือเกิดข้อผิดพลาด",
      );
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col font-sans bg-sky-50">
      {/* Header / Nav */}
      <nav className="w-full p-4 bg-white shadow-sm border-b border-sky-100 flex items-center">
        <Link href="/">
          <Button
            variant="ghost"
            className="text-sky-700 hover:text-sky-900 hover:bg-sky-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้าหลัก
          </Button>
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-sky-100 bg-white p-6 shadow-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-sky-900">
              Admin Login
            </h1>
            <p className="text-sm text-sky-600">
              เข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ดูแลระบบ
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sky-900">
                ชื่อผู้ใช้งาน หรือ อีเมล
              </Label>
              <Input
                id="username"
                placeholder="กรอกชื่อผู้ใช้งาน หรือ อีเมล"
                disabled={isSubmitting}
                {...register("username")}
                className={
                  errors.username
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sky-900">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                disabled={isSubmitting}
                {...register("password")}
                className={
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-sky-700 hover:bg-sky-800 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "เข้าสู่ระบบเจ้าหน้าที่"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
