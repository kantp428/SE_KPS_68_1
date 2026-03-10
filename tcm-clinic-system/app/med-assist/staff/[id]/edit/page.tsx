"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`/api/staff/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            gender: data.gender || "",
            phone_number: data.phone_number || "",
            staff_role: data.staff_role || "",
            username: data.account?.username || "",
            email: data.account?.email || "",
            password: "",
            confirm_password: "",
          });
        } else {
          alert("ไม่พบข้อมูลพนักงาน");
          router.push("/med-assist/staff");
        }
      } catch (err) {
        console.error("Failed to fetch staff details:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchStaff();
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (formData.password && formData.password !== formData.confirm_password) {
      alert("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    if (formData.password && !showSuperKeyDialog) {
      setShowSuperKeyDialog(true);
      return; 
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        ...(formData.password ? { super_key: superKeyInput } : {})
      };

      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/med-assist/staff");
        router.refresh(); 
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/med-assist/staff">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แก้ไขข้อมูลพนักงาน</h1>
          <p className="text-muted-foreground mt-1">อัปเดตข้อมูลรายละเอียดของพนักงาน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-lg bg-card p-6 space-y-8">
        {/* Account Info Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">1. ข้อมูลการเข้าสู่ระบบ (Account)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้ (Username) <span className="text-red-500">*</span></Label>
              <Input id="username" name="username" required value={formData.username} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล (Email) <span className="text-red-500">*</span></Label>
              <Input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">เปลี่ยนรหัสผ่านใหม่ <span className="text-muted-foreground text-xs font-normal">(ไม่บังคับ)</span></Label>
              <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">ยืนยันรหัสผ่านใหม่ <span className="text-muted-foreground text-xs font-normal">(กรณีเปลี่ยนรหัสผ่าน)</span></Label>
              <Input type="password" id="confirm_password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="ยืนยันรหัสผ่าน" required={formData.password.length > 0} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">2. ข้อมูลทั่วไป (Staff Info)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">ชื่อ <span className="text-red-500">*</span></Label>
            <Input id="first_name" name="first_name" required value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">นามสกุล <span className="text-red-500">*</span></Label>
            <Input id="last_name" name="last_name" required value={formData.last_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">เพศ <span className="text-red-500">*</span></Label>
            <select
              id="gender"
              name="gender"
              required
              value={formData.gender}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled hidden>-- กรุณาเลือกเพศ --</option>
              <option value="MALE">ชาย (Male)</option>
              <option value="FEMALE">หญิง (Female)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
            <Input 
              type="tel" 
              id="phone_number" 
              name="phone_number" 
              required 
              value={formData.phone_number} 
              onChange={handleChange} 
              minLength={10} 
              maxLength={10} 
              pattern="[0-9]{10}"
              title="กรุณากรอกตัวเลข 10 หลัก"
              placeholder="08xxxxxxxx"
            />
            <p className="text-xs text-muted-foreground mt-1">ตัวเลข 10 หลัก</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff_role">ตำแหน่ง <span className="text-red-500">*</span></Label>
            <select
              id="staff_role"
              name="staff_role"
              required
              value={formData.staff_role}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled hidden>-- กรุณาเลือกตำแหน่ง --</option>
              <option value="DOCTOR">แพทย์ (Doctor)</option>
              <option value="MED_ASSISTANT">ผู้ช่วยแพทย์ (Med-Assistant)</option>
            </select>
          </div>
          

        </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </form>

      {/* Super Key Dialog */}
      <Dialog open={showSuperKeyDialog} onOpenChange={(open) => {
        setShowSuperKeyDialog(open);
        if (!open) setSuperKeyInput("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการเปลี่ยนรหัสผ่าน</DialogTitle>
            <DialogDescription>
              การเปลี่ยนรหัสผ่านจำเป็นต้องใช้ Super Key เพื่อยืนยันสิทธิ์ กรุณากรอก Super Key ด้านล่าง
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dialog_super_key">Super Key</Label>
              <Input 
                type="password" 
                id="dialog_super_key" 
                value={superKeyInput} 
                onChange={(e) => setSuperKeyInput(e.target.value)} 
                placeholder="กรอก Super Key" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuperKeyDialog(false)}>ยกเลิก</Button>
            <Button onClick={() => handleSubmit()} disabled={loading || !superKeyInput}>
              {loading ? "กำลังตรวจสอบ..." : "ยืนยัน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
