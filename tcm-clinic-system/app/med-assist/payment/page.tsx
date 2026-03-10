"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReceiptCard from "@/components/receipt/ReceiptCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ReceiptText, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// โครงสร้างข้อมูลจำลอ
type PaymentStatus = "UNPAID" | "PAID";

interface Receipt {
  id: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  status: PaymentStatus;
}

const initialMockData: Receipt[] = [
  { id: "1", patientName: "สมชาย สายลม", doctorName: "สมศักดิ์ ใจดี", serviceName: "ฝังเข็ม (Acupuncture)", price: 1500, date: "09/03/2026", time: "11:20", status: "UNPAID" },
  { id: "2", patientName: "กนกวรรณ ขวัญใจ", doctorName: "วิไล รักษ์ธรรม", serviceName: "ตรวจวินิจฉัย (Consultation)", price: 500, date: "09/03/2026", time: "10:27", status: "UNPAID" },
  { id: "3", patientName: "ดวงใจ แสงดาว", doctorName: "สมศักดิ์ ใจดี", serviceName: "นวดทุยหนา (Tuina)", price: 1200, date: "08/03/2026", time: "15:00", status: "PAID" },
];

export default function ReceiptPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(initialMockData);
  const [tab, setTab] = useState<PaymentStatus>("UNPAID");
  const [search, setSearch] = useState("");

  // กรองข้อมูลตาม แท็บ และ ช่องค้นหา
  const filteredReceipts = receipts.filter(
    (r) => r.status === tab && r.patientName.includes(search)
  );

  // ฟังก์ชันจำลองการชำระเงิน (อัปเดตสถานะในเครื่อง)
  const handlePayment = (id: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "PAID" } : r))
    );
    toast.success("ชำระเงินเรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        จัดการใบเสร็จ / ชำระเงิน
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* เลือกสถานะการชำระเงิน */}
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as PaymentStatus)}
            className="w-full lg:w-auto"
          >
            <TabsList>
              <TabsTrigger value="UNPAID">ยังไม่ชำระ</TabsTrigger>
              <TabsTrigger value="PAID">ชำระแล้ว</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ค้นหาชื่อคนไข้ */}
        <div className="relative w-full md:w-72">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="ค้นหาชื่อคนไข้..."
            className="h-10 pl-9 font-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">คนไข้</TableHead>
              <TableHead className="text-center">แพทย์</TableHead>
              <TableHead className="text-center">บริการ</TableHead>
              <TableHead className="text-center">ราคา (บาท)</TableHead>
              <TableHead className="text-center">วันที่</TableHead>
              <TableHead className="text-center">เวลา</TableHead>
              <TableHead className="text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredReceipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-center">{r.patientName}</TableCell>
                  <TableCell className="text-center">{r.doctorName}</TableCell>
                  <TableCell className="text-center">{r.serviceName}</TableCell>
                  <TableCell className="text-center font-semibold text-emerald-600">
                    ฿{r.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">{r.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{r.time}</Badge>
                  </TableCell>
                  
                  {/* ปุ่มกดต่างๆ ด้านหลังตาราง */}
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      
                     
                    <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                        <ReceiptText className="w-4 h-4 mr-2" />
                        ใบเสร็จ
                        </Button>
                    </DialogTrigger>
                    
                    {/* ขยายขนาด Dialog ให้กว้างขึ้นเพื่อรองรับใบเสร็จขนาด A4 ของคุณ และใส่ Scrollbar เผื่อจอยาวไม่พอ */}
                    <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                        <DialogHeader className="sr-only">
                        <DialogTitle>ใบเสร็จรับเงิน - {r.patientName}</DialogTitle>
                        </DialogHeader>
                        
                        {/* สร้างพื้นหลังสีเทา เพื่อให้ตัวใบเสร็จสีขาวของคุณดูลอยเด่นขึ้นมาเหมือนกระดาษจริง */}
                        <div className="bg-muted p-4 md:p-8 rounded-md">
                        
                        {/* เรียกใช้ Component เดิมของคุณ และจัดรูปร่างข้อมูล (Map data) ส่งเข้าไป */}
                        <ReceiptCard 
                            data={{
                            receiptNumber: `TCM-${r.date.replace(/\//g, '')}-${r.id}`, // จำลองเลขใบเสร็จ เช่น TCM-09032026-1
                            date: r.date,
                            patientName: r.patientName,
                            items: [
                                { 
                                name: r.serviceName, // เอาชื่อบริการมาใส่เป็นรายการที่ 1
                                qty: 1, 
                                price: r.price 
                                }
                            ],
                            total: r.price
                            }} 
                        />
                        
                        </div>
                    </DialogContent>
                    </Dialog>

                      {/* 2. ปุ่มยืนยันชำระเงิน (Alert Dialog) จะโชว์แค่ตอนยังไม่ชำระ */}
                      {r.status === "UNPAID" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              ชำระเงิน
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการชำระเงิน?</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณต้องการยืนยันการรับชำระเงินยอด <strong>฿{r.price.toLocaleString()}</strong> จากคุณ <strong>{r.patientName}</strong> ใช่หรือไม่?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handlePayment(r.id)}>
                                ยืนยันชำระเงิน
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}