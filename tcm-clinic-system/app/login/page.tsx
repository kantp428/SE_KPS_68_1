"use client";

import { handleException } from "@/app/utils/handleException";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatThaiId } from "../utils/formatThaiId";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const { setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useLogin();

  const [thaiId, setThaiId] = useState("");
  const [idError, setIdError] = useState("");
  const [isCheckingId, setIsCheckingId] = useState(false);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleCheckId = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdError("");

    if (!thaiId || thaiId.length !== 13) {
      setIdError("กรุณากรอกรหัสบัตรประชาชน 13 หลัก");
      return;
    }

    setIsCheckingId(true);
    try {
      const res = await fetch(`/api/patient/check-id/${thaiId}`);
      if (!res.ok) {
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบข้อมูล");
        return;
      }

      const data = await res.json();

      if (data.exists && data.hasAccount) {
        setIsPasswordDialogOpen(true);
        return;
      }

      toast.info("ไม่พบบัญชีผู้ใช้งาน กรุณาลงทะเบียน", { duration: 4000 });
      router.push(`/register?thaiId=${thaiId}`);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!password) {
      setPasswordError("กรุณากรอกรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        username: thaiId,
        password,
      });

      toast.success("เข้าสู่ระบบสำเร็จ");
      setIsPasswordDialogOpen(false);
      router.push("/patient");
      router.refresh();
    } catch (error: unknown) {
      setPasswordError(
        handleException(error, "รหัสผ่านไม่ถูกต้องหรือเกิดข้อผิดพลาด"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      <nav className="flex w-full items-center border-b bg-white/90 p-4 shadow-sm backdrop-blur">
        <Link href="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับหน้าแรก
          </Button>
        </Link>
      </nav>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              TCM Clinic System
            </h1>
            <p className="text-sm text-muted-foreground">
              เข้าสู่ระบบเพื่อเข้าใช้งานระบบคลินิก
            </p>
          </div>

          <form onSubmit={handleCheckId} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thai_id">รหัสบัตรประชาชน 13 หลัก</Label>
              <Input
                id="thai_id"
                disabled={isCheckingId}
                value={formatThaiId(thaiId)}
                onChange={(e) =>
                  setThaiId(e.target.value.replace(/\D/g, "").slice(0, 13))
                }
                maxLength={17}
                placeholder="x-xxxx-xxxxx-xx-x"
                className={
                  idError
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {idError && <p className="text-xs text-destructive">{idError}</p>}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isCheckingId || thaiId.length !== 13}
              >
                {isCheckingId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "ดำเนินการต่อ"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {isPasswordDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg duration-200">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-lg font-bold">ยืนยันรหัสผ่าน</h2>
                <p className="text-sm text-muted-foreground">
                  กรุณากรอกรหัสผ่านสำหรับรหัสประชาชน {formatThaiId(thaiId)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  className={passwordError ? "border-destructive" : ""}
                />
                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setPassword("");
                    setPasswordError("");
                  }}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
