"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { formatPhoneNumber } from "@/app/utils/formatPhoneNumber";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StaffRole = "DOCTOR" | "MED_ASSISTANT" | "";
type Gender = "MALE" | "FEMALE" | "";

type StaffFormData = {
  first_name: string;
  last_name: string;
  gender: Gender;
  phone_number: string;
  staff_role: StaffRole;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
};

const stripPhoneNumber = (value: string) => value.replace(/\D/g, "").slice(0, 10);

export default function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    first_name: "",
    last_name: "",
    gender: "",
    phone_number: "",
    staff_role: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showSuperKeyDialog, setShowSuperKeyDialog] = useState(false);
  const [superKeyInput, setSuperKeyInput] = useState("");

  const updateField = <K extends keyof StaffFormData>(field: K, value: StaffFormData[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`/api/staff/${id}`);

        if (!res.ok) {
          alert("ไม่พบข้อมูลพนักงาน");
          router.push("/med-assist/staff");
          return;
        }

        const data = await res.json();

        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          gender: data.gender || "",
          phone_number: formatPhoneNumber(data.phone_number || ""),
          staff_role: data.staff_role || "",
          username: data.account?.username || "",
          email: data.account?.email || "",
          password: "",
          confirm_password: "",
        });
      } catch (error) {
        console.error("Failed to fetch staff details:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      updateField("phone_number", formatPhoneNumber(stripPhoneNumber(value)));
      return;
    }

    switch (name) {
      case "username":
      case "email":
      case "password":
      case "confirm_password":
      case "first_name":
      case "last_name":
        updateField(name, value);
        break;
      default:
        break;
    }
  };

  const validateForm = () => {
    if (formData.password && formData.password !== formData.confirm_password) {
      alert("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return false;
    }

    if (!formData.gender || !formData.staff_role) {
      alert("กรุณาเลือกเพศและตำแหน่ง");
      return false;
    }

    if (stripPhoneNumber(formData.phone_number).length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ 10 หลัก");
      return false;
    }

    return true;
  };

  const submitEdit = async () => {
    setShowConfirmDialog(false);

    if (formData.password && !showSuperKeyDialog) {
      setShowSuperKeyDialog(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        phone_number: stripPhoneNumber(formData.phone_number),
        ...(formData.password ? { super_key: superKeyInput } : {}),
      };

      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/med-assist/staff");
        router.refresh();
        return;
      }

      const errorData = await res.json();
      alert(`เกิดข้อผิดพลาด: ${errorData.message || "Unknown error"}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/med-assist/staff">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">แก้ไขข้อมูลพนักงาน</h1>
            <p className="text-sm text-muted-foreground">
              ปรับปรุงบัญชีผู้ใช้และข้อมูลพนักงานในระบบ
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border/70">
          <CardHeader className="border-b">
            <CardTitle>รายละเอียดพนักงาน</CardTitle>
            <CardDescription>แก้ไขข้อมูลที่ต้องการแล้วกดบันทึก</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-medium">บัญชีผู้ใช้</h2>
                <p className="text-sm text-muted-foreground">ข้อมูลสำหรับเข้าสู่ระบบ</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">ชื่อผู้ใช้</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่านใหม่</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    required={formData.password.length > 0}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-medium">ข้อมูลทั่วไป</h2>
                <p className="text-sm text-muted-foreground">ใช้แสดงในหน้าจัดการพนักงาน</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">ชื่อ</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">นามสกุล</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">เพศ</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateField("gender", value as Gender)}
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="เลือกเพศ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">ชาย</SelectItem>
                      <SelectItem value="FEMALE">หญิง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff_role">ตำแหน่ง</Label>
                  <Select
                    value={formData.staff_role}
                    onValueChange={(value) => updateField("staff_role", value as StaffRole)}
                  >
                    <SelectTrigger id="staff_role" className="w-full">
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCTOR">แพทย์</SelectItem>
                      <SelectItem value="MED_ASSISTANT">ผู้ช่วยแพทย์</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone_number">เบอร์โทรศัพท์</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>+66</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      inputMode="numeric"
                      required
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="081-234-5678"
                    />
                  </InputGroup>
                  <p className="text-xs text-muted-foreground">รองรับตัวเลข 10 หลักและจัดรูปแบบให้อัตโนมัติ</p>
                </div>
              </div>
            </section>
          </CardContent>

          <CardFooter className="justify-end gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog
        open={showSuperKeyDialog}
        onOpenChange={(open) => {
          setShowSuperKeyDialog(open);
          if (!open) setSuperKeyInput("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนรหัสผ่าน</DialogTitle>
            <DialogDescription>
              การเปลี่ยนรหัสผ่านต้องใช้ Super Key เพื่อยืนยันสิทธิ์
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="dialog_super_key">Super Key</Label>
            <Input
              id="dialog_super_key"
              type="password"
              value={superKeyInput}
              onChange={(e) => setSuperKeyInput(e.target.value)}
              placeholder="กรอก Super Key"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuperKeyDialog(false)}>
              ยกเลิก
            </Button>
            <Button onClick={submitEdit} disabled={loading || !superKeyInput}>
              {loading ? "กำลังตรวจสอบ..." : "ยืนยัน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="ยืนยันการบันทึก"
        description="ต้องการบันทึกการแก้ไขข้อมูลพนักงานนี้ใช่หรือไม่"
        confirmText={loading ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
        onConfirm={submitEdit}
      />
    </div>
  );
}
