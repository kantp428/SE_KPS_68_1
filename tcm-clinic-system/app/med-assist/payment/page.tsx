"use client";

import ReceiptCard from "@/components/receipt/ReceiptCard"; // อ้างอิง Component ใบเสร็จของคุณ
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce"; // ใช้ Hook เดิมของคุณ
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  CalendarIcon,
  CheckCircle,
  ReceiptText,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

// กำหนดรูปร่างข้อมูลที่รับมาจาก API
type InvoiceStatus = "UNPAID" | "PAID";

interface InvoiceData {
  id: string;
  receiptNumber: string;
  patientName: string;
  total: number;
  status: InvoiceStatus;
  date: string;
  time: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

export default function PaymentPage() {
  const [list, setList] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [tab, setTab] = useState<InvoiceStatus>("UNPAID");
  const [nameSearch, setNameSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const debouncedNameSearch = useDebounce(nameSearch, 500);

  // ฟังก์ชันดึงข้อมูลจาก API สไตล์เดียวกับต้นฉบับ
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      // สร้าง Query String
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        status: tab,
        ...(debouncedNameSearch && { name: debouncedNameSearch }),
      });

      const res = await fetch(`/api/invoice?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      setList(json.data);
      setTotalPages(json.pagination.totalPages || 1);
      setTotalItems(json.pagination.total || 0);
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลใบเสร็จได้");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, tab, debouncedNameSearch]);

  // ดึงข้อมูลเมื่อตัวแปรเปลี่ยน
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleRefresh = async () => {
    await fetchInvoices();
    toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
  };

  // ฟังก์ชันยืนยันชำระเงิน (ต้องมี API PATCH รองรับในอนาคต)
  const handlePayment = async (id: string) => {
    try {
      // สมมติว่ามี API สำหรับอัปเดตสถานะ (ถ้ายังไม่มี โค้ดนี้จะจำลองการเปลี่ยนสถานะให้ก่อน)

      const res = await fetch("/api/invoice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "PAID" }),
      });
      if (!res.ok) throw new Error("API error");

      // อัปเดต UI ทันที (ไม่ต้องรอ Refresh)
      setList((prev) => prev.filter((item) => item.id !== id));
      toast.success("ชำระเงินเรียบร้อยแล้ว");

      // ถ้าอยากให้โหลดข้อมูลใหม่ทั้งหมด ให้เรียก fetchInvoices()
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการชำระเงิน");
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        จัดการชำระเงิน / ออกใบเสร็จ
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as InvoiceStatus);
              setCurrentPage(1); // รีเซ็ตหน้ากลับไปหน้าแรกเสมอเมื่อเปลี่ยนแท็บ
            }}
            className="w-full lg:w-auto"
          >
            <TabsList>
              <TabsTrigger value="UNPAID">ยังไม่ชำระ</TabsTrigger>
              <TabsTrigger value="PAID">ชำระแล้ว</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCcw
                className={cn("w-4 h-4", loading && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="ค้นหาชื่อคนไข้..."
              className="h-10 pl-9 font-normal"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: th })
                ) : (
                  <span>เลือกวันที่...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={th}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ตารางข้อมูล (เหมือนของ Treatment) */}
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center min-w-30">
                เลขที่ใบเสร็จ
              </TableHead>
              <TableHead className="text-center min-w-37.5">คนไข้</TableHead>
              <TableHead className="text-center min-w-30">
                ยอดชำระ (บาท)
              </TableHead>
              <TableHead className="w-32 text-center">วันที่</TableHead>
              <TableHead className="w-28 text-center">เวลา</TableHead>
              <TableHead className="w-40 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-24 mx-auto bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 mx-auto bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 mx-auto bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 mx-auto bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-16 mx-auto rounded-full bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                      <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  ไม่พบข้อมูลใบเสร็จ
                </TableCell>
              </TableRow>
            ) : (
              list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {r.receiptNumber}
                  </TableCell>
                  <TableCell className="text-center">{r.patientName}</TableCell>
                  <TableCell className="text-center font-semibold text-emerald-600">
                    ฿{r.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">{r.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="border-blue-950 bg-blue-50 text-blue-900"
                    >
                      {r.time}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {/* 1. ปุ่มดูใบเสร็จ */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ReceiptText className="w-4 h-4 mr-1" />
                            ใบเสร็จ
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh] bg-muted">
                          <DialogHeader className="sr-only">
                            <DialogTitle>
                              ใบเสร็จรับเงิน - {r.patientName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="p-2">
                            {/* เรียกใช้ Component ใบเสร็จต้นฉบับของคุณตรงนี้! */}
                            <ReceiptCard
                              data={{
                                receiptNumber: r.receiptNumber,
                                date: r.date,
                                patientName: r.patientName,
                                items: r.items,
                                total: r.total,
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* 2. ปุ่มยืนยันชำระเงิน (แสดงเฉพาะแท็บ UNPAID) */}
                      {tab === "UNPAID" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              ชำระเงิน
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ยืนยันการรับชำระเงิน
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณได้รับเงินจำนวน{" "}
                                <strong>฿{r.total.toLocaleString()}</strong>{" "}
                                จากคุณ <strong>{r.patientName}</strong>{" "}
                                ครบถ้วนแล้วใช่หรือไม่?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handlePayment(r.id)}
                              >
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

      {/* Pagination (ลอกต้นฉบับมาเป๊ะๆ) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 w-full">
        <p className="text-xs text-muted-foreground font-medium">
          หน้า {currentPage} จาก {totalPages} (รวม {totalItems} รายการ)
        </p>
        <div className="w-full sm:w-auto flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={cn(
                    "cursor-pointer",
                    currentPage === 1 && "pointer-events-none opacity-40",
                  )}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <PaginationItem key={num} className="cursor-pointer">
                    <PaginationLink
                      isActive={currentPage === num}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  className={cn(
                    "cursor-pointer",
                    currentPage === totalPages &&
                      "pointer-events-none opacity-40",
                  )}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
