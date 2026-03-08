"use client";

import { handleException } from "@/app/utils/handleException";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRegister } from "@/hooks/useRegister";
import { RegisterFormValues } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z
    .object({
        username: z.string().min(4, "ชื่อผู้ใช้งานต้องมีอย่างน้อย 4 ตัวอักษร"),
        email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
        password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
        confirmPassword: z.string().min(6, "กรุณายืนยันรหัสผ่าน"),
        firstName: z.string().min(1, "กรุณากรอกชื่อ"),
        lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
        thaiId: z.string().length(13, "รหัสบัตรประชาชนต้องมี 13 หลัก"),
        birthdate: z.string().min(1, "กรุณาระบุวันเกิด"),
        gender: z.enum(["MALE", "FEMALE"], {
            message: "กรุณาเลือกเพศ",
        }),
        phoneNumber: z.string().min(9, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก"),
        bloodGroup: z.enum(["A", "B", "AB", "O"], {
            message: "กรุณาเลือกหมู่เลือด",
        }),
        chronicDisease: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
        path: ["confirmPassword"],
    });

type LocalRegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [isExistingPatient, setIsExistingPatient] = useState(false);
    const [thaiIdCheckError, setThaiIdCheckError] = useState("");
    const [thaiIdValue, setThaiIdValue] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register: registerUserApi } = useRegister();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LocalRegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            gender: undefined,
            bloodGroup: undefined,
        },
    });

    const handleCheckId = async (e: React.FormEvent) => {
        e.preventDefault();
        setThaiIdCheckError("");
        if (thaiIdValue.length !== 13) {
            setThaiIdCheckError("รหัสบัตรประชาชนต้องมี 13 หลัก");
            return;
        }

        setIsCheckingId(true);
        try {
            const res = await fetch(`/api/patient/check-id/${thaiIdValue}`);
            if (!res.ok) {
                toast.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
                return;
            }
            const data = await res.json();

            if (data.exists && data.hasAccount) {
                toast.error("รหัสบัตรประชาชนนี้ถูกลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ", { duration: 5000 });
                router.push("/login");
                return;
            }

            // Move to step 2 and populate
            setValue("thaiId", thaiIdValue);
            if (data.exists && data.patient) {
                setIsExistingPatient(true);
                setValue("firstName", data.patient.firstName);
                setValue("lastName", data.patient.lastName);
                setValue("birthdate", data.patient.birthdate);
                setValue("gender", data.patient.gender);
                setValue("phoneNumber", data.patient.phoneNumber);
                setValue("bloodGroup", data.patient.bloodGroup);
                setValue("chronicDisease", data.patient.chronicDisease || "");
                toast.success("พบข้อมูลประวัติการรักษา กรุณาสร้างบัญชีผู้ใช้งาน");
            } else {
                setIsExistingPatient(false);
            }

            setStep(2);
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
        } finally {
            setIsCheckingId(false);
        }
    };

    const onSubmit = async (data: LocalRegisterFormValues) => {
        setIsSubmitting(true);
        try {
            await registerUserApi(data);
            toast.success("ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ");
            router.push("/login");
            router.refresh();
        } catch (e: unknown) {
            const errorMessage = handleException(e, "เกิดข้อผิดพลาดในการลงทะเบียน");
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 p-4 py-8">
            <div className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">ลงทะเบียนผู้ป่วยใหม่</h1>
                    <p className="text-sm text-muted-foreground">
                        กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้งานระบบคลินิก TCM
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleCheckId} className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">ตรวจสอบข้อมูลผู้ป่วย</h2>
                            <div className="space-y-2">
                                <Label htmlFor="checkThaiId">รหัสบัตรประชาชน (13 หลัก) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="checkThaiId"
                                    placeholder="รหัสบัตรประชาชน"
                                    maxLength={13}
                                    value={thaiIdValue}
                                    onChange={(e) => setThaiIdValue(e.target.value)}
                                    disabled={isCheckingId}
                                    className={thaiIdCheckError ? "border-destructive" : ""}
                                />
                                {thaiIdCheckError && (
                                    <p className="text-xs text-destructive">{thaiIdCheckError}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push("/login")}
                                disabled={isCheckingId}
                            >
                                กลับไปหน้าเข้าสู่ระบบ
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isCheckingId}
                            >
                                {isCheckingId ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "ตรวจสอบข้อมูล"
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* ส่วนของบัญชีผู้ใช้ */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">ข้อมูลบัญชี</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">ชื่อผู้ใช้งาน (Username) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="username"
                                        placeholder="เช่น johndoe"
                                        disabled={isSubmitting}
                                        {...register("username")}
                                        className={errors.username ? "border-destructive" : ""}
                                    />
                                    {errors.username && (
                                        <p className="text-xs text-destructive">{errors.username.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">อีเมล <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="เช่น john@example.com"
                                        disabled={isSubmitting}
                                        {...register("email")}
                                        className={errors.email ? "border-destructive" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">{errors.email.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">รหัสผ่าน <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="กรอกรหัสผ่าน"
                                        disabled={isSubmitting}
                                        {...register("password")}
                                        className={errors.password ? "border-destructive" : ""}
                                    />
                                    {errors.password && (
                                        <p className="text-xs text-destructive">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                                        disabled={isSubmitting}
                                        {...register("confirmPassword")}
                                        className={errors.confirmPassword ? "border-destructive" : ""}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ส่วนของข้อมูลส่วนตัว */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold border-b pb-2">ข้อมูลส่วนตัวผู้ป่วย</h2>
                            {isExistingPatient && (
                                <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                                    ระบบพบฐานข้อมูลประวัติการรักษาของคุณแล้ว ข้อมูลด้านล่างจะถูกตั้งเป็นโหมดอ่านอย่างเดียว
                                </p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">ชื่อจริง <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="firstName"
                                        placeholder="ชื่อ"
                                        readOnly={isExistingPatient}
                                        disabled={isSubmitting}
                                        {...register("firstName")}
                                        className={`${errors.firstName ? "border-destructive" : ""} ${isExistingPatient ? "bg-muted cursor-not-allowed" : ""}`}
                                    />
                                    {errors.firstName && (
                                        <p className="text-xs text-destructive">{errors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">นามสกุล <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="lastName"
                                        placeholder="นามสกุล"
                                        readOnly={isExistingPatient}
                                        disabled={isSubmitting}
                                        {...register("lastName")}
                                        className={`${errors.lastName ? "border-destructive" : ""} ${isExistingPatient ? "bg-muted cursor-not-allowed" : ""}`}
                                    />
                                    {errors.lastName && (
                                        <p className="text-xs text-destructive">{errors.lastName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="thaiId">รหัสบัตรประชาชน (13 หลัก) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="thaiId"
                                        placeholder="รหัสบัตรประชาชน"
                                        maxLength={13}
                                        readOnly={true}
                                        disabled={isSubmitting}
                                        {...register("thaiId")}
                                        className={`bg-muted cursor-not-allowed ${errors.thaiId ? "border-destructive" : ""}`}
                                    />
                                    {errors.thaiId && (
                                        <p className="text-xs text-destructive">{errors.thaiId.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthdate">วันเกิด <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        readOnly={isExistingPatient}
                                        disabled={isSubmitting}
                                        {...register("birthdate")}
                                        className={`${errors.birthdate ? "border-destructive" : ""} ${isExistingPatient ? "bg-muted cursor-not-allowed" : ""}`}
                                    />
                                    {errors.birthdate && (
                                        <p className="text-xs text-destructive">{errors.birthdate.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">เพศ <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={watch("gender")}
                                        onValueChange={(val) => setValue("gender", val as "MALE" | "FEMALE", { shouldValidate: true })}
                                        disabled={isSubmitting || isExistingPatient}
                                    >
                                        <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                                            <SelectValue placeholder="เลือกเพศ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">ชาย</SelectItem>
                                            <SelectItem value="FEMALE">หญิง</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-xs text-destructive">{errors.gender.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">เบอร์โทรศัพท์ <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="เบอร์โทรศัพท์"
                                        readOnly={isExistingPatient}
                                        disabled={isSubmitting}
                                        {...register("phoneNumber")}
                                        className={`${errors.phoneNumber ? "border-destructive" : ""} ${isExistingPatient ? "bg-muted cursor-not-allowed" : ""}`}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup">หมู่เลือด <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={watch("bloodGroup")}
                                        onValueChange={(val) => setValue("bloodGroup", val as "A" | "B" | "AB" | "O", { shouldValidate: true })}
                                        disabled={isSubmitting || isExistingPatient}
                                    >
                                        <SelectTrigger className={errors.bloodGroup ? "border-destructive" : ""}>
                                            <SelectValue placeholder="เลือกหมู่เลือด" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="AB">AB</SelectItem>
                                            <SelectItem value="O">O</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.bloodGroup && (
                                        <p className="text-xs text-destructive">{errors.bloodGroup.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chronicDisease">โรคประจำตัว (ถ้ามี)</Label>
                                    <Input
                                        id="chronicDisease"
                                        placeholder="เช่น เบาหวาน, ความดัน"
                                        readOnly={isExistingPatient}
                                        disabled={isSubmitting}
                                        {...register("chronicDisease")}
                                        className={isExistingPatient ? "bg-muted cursor-not-allowed" : ""}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep(1)}
                                disabled={isSubmitting}
                            >
                                ย้อนกลับ
                            </Button>

                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    "ยืนยันการลงทะเบียน"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
