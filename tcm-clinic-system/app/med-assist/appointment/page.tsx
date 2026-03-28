"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { useAppointmentStatusUpdate } from "@/hooks/useAppointmentStatusUpdate";
import { useDebounce } from "@/hooks/use-debounce";
import { useMedAssistAppointment } from "@/hooks/useMedAssistAppointment";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, RefreshCcw, Search, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/app/utils/formatPhoneNumber";

const MedAssistAppointmentPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [tab, setTab] = useState<string>("CONFIRMED");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: number;
    patientName: string;
  } | null>(null);

  const [nameSearch, setNameSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const debouncedNameSearch = useDebounce(nameSearch, 500);
  const selectedDateParam = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;
  const hasSyncedExpiredAppointments = useRef(false);

  const { updateAppointmentStatus, loading: updatingStatus } =
    useAppointmentStatusUpdate();

  const { list, loading, error, fetchList } = useMedAssistAppointment(
    currentPage,
    limit,
    tab,
    debouncedNameSearch,
    selectedDateParam,
  );

  const totalPages = list?.pagination?.totalPages || 1;

  useEffect(() => {
    if (hasSyncedExpiredAppointments.current) {
      return;
    }

    hasSyncedExpiredAppointments.current = true;

    const syncExpiredAppointments = async () => {
      try {
        const response = await fetch("/api/med-assist/appointment", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "COMPLETED" }),
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as { updatedCount?: number };

        if ((result.updatedCount ?? 0) > 0) {
          await fetchList();
        }
      } catch (error) {
        console.error("Failed to sync appointment statuses:", error);
      }
    };

    void syncExpiredAppointments();
  }, [fetchList]);

  const handleRefresh = async () => {
    try {
      await fetchList();
      toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
    } catch {
      toast.error("รีเฟรชล้มเหลว");
    }
  };

  const openCancelDialog = (appointmentId: number, patientName: string) => {
    setSelectedAppointment({ id: appointmentId, patientName });
    setCancelDialogOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await updateAppointmentStatus(selectedAppointment.id, "CANCELLED");
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      await fetchList();
      toast.success("ยกเลิกการจองเรียบร้อยแล้ว");
    } catch {
      toast.error("ไม่สามารถยกเลิกการจองได้");
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
        <Button onClick={handleRefresh} className="mt-4">
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        จัดการการจองคิว
      </h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v);
              setCurrentPage(1);
            }}
            className="w-full lg:w-auto"
          >
            <TabsList>
              <TabsTrigger value="CONFIRMED">รอเข้ารับบริการ</TabsTrigger>
              <TabsTrigger value="COMPLETED">ดำเนินการสำเร็จ</TabsTrigger>
              <TabsTrigger value="CANCELLED">ยกเลิกแล้ว</TabsTrigger>
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
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
            <Button onClick={() => router.push("/med-assist/appointment/new")}>
              + เพิ่มการจองใหม่
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

          {selectedDate && (
            <Button
              type="button"
              variant="ghost"
              className="h-10 justify-self-start px-2 text-muted-foreground lg:justify-self-center"
              onClick={() => setSelectedDate(undefined)}
            >
              ล้างวันที่
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-48 w-1/4 pl-6 text-left">
                คนไข้
              </TableHead>
              <TableHead className="min-w-32 w-40 text-center">
                เบอร์โทร
              </TableHead>
              <TableHead className="w-32 text-center">วันที่</TableHead>
              <TableHead className="w-28 text-center">เวลา</TableHead>
              <TableHead className="w-32 text-center">สถานะ</TableHead>
              {tab === "CONFIRMED" && (
                <TableHead className="w-32 text-center">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="ml-6 h-5 w-32 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-5 w-24 bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-7 w-28 rounded-full bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-7 w-20 rounded-full bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-7 w-24 rounded-full bg-muted" />
                  </TableCell>
                  {tab === "CONFIRMED" && (
                    <TableCell>
                      <Skeleton className="mx-auto h-8 w-24 rounded-md bg-muted" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : list?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tab === "CONFIRMED" ? 6 : 5}
                  className="py-10 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลการจอง
                </TableCell>
              </TableRow>
            ) : (
              list?.data.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="pl-6 text-left font-medium">
                    {appointment.patientName}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground font-mono">
                    {formatPhoneNumber(appointment.patientPhone) || "-"}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="border-emerald-900 bg-emerald-50 text-emerald-900"
                    >
                      {appointment.date
                        ? format(parseISO(appointment.datetime), "dd/MM/yyyy", {
                            locale: th,
                          })
                        : "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="border-blue-950 bg-blue-50 text-blue-900"
                    >
                      {appointment.time}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        appointment.status === "CONFIRMED" &&
                          "border-blue-600 text-blue-600",
                        appointment.status === "COMPLETED" &&
                          "border-green-600 text-green-600",
                        appointment.status === "CANCELLED" &&
                          "border-red-600 text-red-600",
                      )}
                    >
                      {appointment.status === "CONFIRMED" && "รอดำเนินการ"}
                      {appointment.status === "COMPLETED" && "สำเร็จ"}
                      {appointment.status === "CANCELLED" && "ยกเลิก"}
                    </Badge>
                  </TableCell>
                  {appointment.status === "CONFIRMED" && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-blue-200 text-blue-600 hover:bg-blue-200 hover:text-blue-700"
                          title="จัดการข้อมูล"
                          onClick={() =>
                            router.push(
                              `/med-assist/treatment/new?appointmentId=${appointment.id}&patientId=${appointment.patientId}`,
                            )
                          }
                        >
                          จัดการ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="ยกเลิกการจอง"
                          onClick={() =>
                            openCancelDialog(
                              appointment.id,
                              appointment.patientName,
                            )
                          }
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex w-full flex-col items-center justify-between gap-4 px-2 sm:flex-row">
        <p className="text-xs font-medium text-muted-foreground">
          หน้า {currentPage} จาก {totalPages} (รวม{" "}
          {list?.pagination?.total || 0} รายการ)
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

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
        title="ยืนยันการยกเลิกการจอง"
        description={
          selectedAppointment
            ? `ต้องการยกเลิกการจองของ ${selectedAppointment.patientName} ใช่หรือไม่`
            : "ต้องการยกเลิกการจองนี้ใช่หรือไม่"
        }
        onConfirm={handleCancelAppointment}
        cancelText="กลับ"
        confirmText={updatingStatus ? "กำลังยกเลิก..." : "ยืนยันการยกเลิก"}
        isDestructive
      />
    </div>
  );
};

export default MedAssistAppointmentPage;
