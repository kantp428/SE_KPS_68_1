"use client";

import ReceiptCard from "@/components/receipt/ReceiptCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useDebounce } from "@/hooks/use-debounce";
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
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type PaymentTab = "IN_PROGRESS" | "PAYMENT";

interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  treatmentStatus: "IN_PROGRESS" | "COMPLETED" | null;
}

interface InvoiceData {
  id: string;
  receiptNumber: string;
  patientName: string;
  total: number;
  status: "UNPAID" | "PAID";
  date: string;
  time: string;
  treatmentCount: number;
  allTreatmentsCompleted: boolean;
  canPay: boolean;
  items: InvoiceItem[];
}

export default function PaymentPage() {
  const [list, setList] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tab, setTab] = useState<PaymentTab>("IN_PROGRESS");
  const [nameSearch, setNameSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const debouncedNameSearch = useDebounce(nameSearch, 500);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        status: "UNPAID",
        mode: tab === "IN_PROGRESS" ? "in_progress" : "payment",
        ...(debouncedNameSearch && { name: debouncedNameSearch }),
        ...(selectedDate && { date: format(selectedDate, "yyyy-MM-dd") }),
      });

      const response = await fetch(`/api/invoice?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");

      const json = await response.json();
      setList(json.data);
      setTotalPages(json.pagination.totalPages || 1);
      setTotalItems(json.pagination.total || 0);
    } catch {
      toast.error("ไม่สามารถดึงข้อมูลใบเสร็จได้");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, tab, debouncedNameSearch, selectedDate]);

  useEffect(() => {
    void fetchInvoices();
  }, [fetchInvoices]);

  const handleRefresh = async () => {
    await fetchInvoices();
    toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
  };

  const handlePayment = async (id: string) => {
    try {
      const response = await fetch("/api/invoice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "PAID" }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || "Payment failed");
      }

      setList((prev) => prev.filter((item) => item.id !== id));
      toast.success("ชำระเงินเรียบร้อยแล้ว");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการชำระเงิน",
      );
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        จัดการการชำระเงิน / ออกใบเสร็จ
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={tab}
            onValueChange={(value) => {
              setTab(value as PaymentTab);
              setCurrentPage(1);
            }}
            className="w-full lg:w-auto"
          >
            <TabsList>
              <TabsTrigger value="IN_PROGRESS">กำลังดำเนินการ</TabsTrigger>
              <TabsTrigger value="PAYMENT">ชำระเงิน</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
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
                variant="outline"
                className={cn(
                  "h-10 w-full justify-start text-left font-normal",
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

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-30 text-center">เลขที่ใบเสร็จ</TableHead>
              <TableHead className="min-w-37.5 text-center">คนไข้</TableHead>
              <TableHead className="min-w-30 text-center">ยอดชำระ (บาท)</TableHead>
              <TableHead className="w-32 text-center">วันที่</TableHead>
              <TableHead className="w-28 text-center">เวลา</TableHead>
              <TableHead className="w-32 text-center">สถานะ</TableHead>
              <TableHead className="w-40 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="mx-auto h-5 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-5 w-32 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-5 w-20 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-5 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-7 w-16 rounded-full bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-7 w-24 rounded-full bg-muted" />
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
                  colSpan={7}
                  className="py-10 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลใบเสร็จ
                </TableCell>
              </TableRow>
            ) : (
              list.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {invoice.receiptNumber}
                  </TableCell>
                  <TableCell className="text-center">
                    {invoice.patientName}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-emerald-600">
                    ฿{invoice.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">{invoice.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="border-blue-950 bg-blue-50 text-blue-900"
                    >
                      {invoice.time}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        invoice.canPay
                          ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                          : "border-amber-900 bg-amber-50 text-amber-900"
                      }
                    >
                      {invoice.canPay ? "พร้อมชำระ" : "กำลังดำเนินการ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ReceiptText className="mr-1 h-4 w-4" />
                            รายละเอียด
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-muted">
                          <DialogHeader className="sr-only">
                            <DialogTitle>
                              รายละเอียดใบเสร็จ - {invoice.patientName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="p-2">
                            <ReceiptCard id={invoice.id} />
                          </div>
                        </DialogContent>
                      </Dialog>

                      {tab === "PAYMENT" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={!invoice.canPay}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              ชำระเงิน
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ยืนยันการรับชำระเงิน
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                รับชำระเงินจำนวน{" "}
                                <strong>฿{invoice.total.toLocaleString()}</strong>{" "}
                                จากคุณ <strong>{invoice.patientName}</strong>{" "}
                                ใช่หรือไม่?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handlePayment(invoice.id)}
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

      <div className="flex w-full flex-col items-center justify-between gap-4 px-2 sm:flex-row">
        <p className="text-xs font-medium text-muted-foreground">
          หน้า {currentPage} จาก {totalPages} (รวม {totalItems} รายการ)
        </p>

        <div className="flex w-full justify-center sm:w-auto">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={cn(
                    "cursor-pointer",
                    currentPage === 1 && "pointer-events-none opacity-40",
                  )}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationItem key={page} className="cursor-pointer">
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
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
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
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
