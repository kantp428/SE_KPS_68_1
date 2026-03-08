"use client";

import { handleException } from "@/app/utils/handleException";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
    identifier: z.string().min(1, "กรุณากรอกชื่อผู้ใช้งาน หรือ อีเมล"),
    password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsSubmitting(true);
        try {
            const isEmail = data.identifier.includes("@");

            await login({
                ...(isEmail ? { email: data.identifier } : { username: data.identifier }),
                password: data.password,
            });

            toast.success("เข้าสู่ระบบสำเร็จ");
            // Redirect to patient dashboard
            router.push("/patient");
            router.refresh();

        } catch (e: unknown) {
            const errorMessage = handleException(e, "ข้อมูลประจำตัวไม่ถูกต้อง หรือเกิดข้อผิดพลาด");
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">TCM Clinic System</h1>
                    <p className="text-sm text-muted-foreground">เข้าสู่ระบบเพื่อเข้าใช้งานระบบคลินิก</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="identifier">ชื่อผู้ใช้งาน หรือ อีเมล</Label>
                        <Input
                            id="identifier"
                            placeholder="กรอกชื่อผู้ใช้งาน หรือ อีเมล"
                            disabled={isSubmitting}
                            {...register("identifier")}
                            className={errors.identifier ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.identifier && (
                            <p className="text-xs text-destructive">{errors.identifier.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">รหัสผ่าน</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="กรอกรหัสผ่าน"
                            disabled={isSubmitting}
                            {...register("password")}
                            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        ยังไม่มีบัญชีใช่หรือไม่?{" "}
                        <Button
                            variant="link"
                            className="p-0 h-auto font-semibold"
                            onClick={() => router.push("/register")}
                            type="button"
                        >
                            ลงทะเบียนผู้ป่วยใหม่
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
