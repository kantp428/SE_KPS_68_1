"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { useMedAssistAppointment } from "@/hooks/useMedAssistAppointment";
import { cn } from "@/lib/utils";
import { appointment_status_enum } from "@prisma/client";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import {
    CalendarIcon,
    RefreshCcw,
    Search,
    XCircle,
    CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MedAssistAppointmentPage = () => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [tab, setTab] = useState<string>("CONFIRMED");

    // Search States
    const [nameSearch, setNameSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const debouncedNameSearch = useDebounce(nameSearch, 500);
    const selectedDateParam = selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : undefined;

    const { list, loading, error, fetchList, //updateStatus 
    } = useMedAssistAppointment(
        currentPage,
        limit,
        tab,
        debouncedNameSearch,
        selectedDateParam
    );

    const handleRefresh = async () => {
        try {
            await fetchList();
            toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
        } catch (err) {
            toast.error("รีเฟรชล้มเหลว");
        }
    };

    const totalPages = list?.pagination?.totalPages || 1;

    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <Button onClick={handleRefresh} className="mt-4">ลองใหม่</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-6">
            <h1 className="font-sans text-2xl font-bold tracking-tight">
                จัดการการจองคิว
            </h1>

            <div className="flex flex-col gap-4">
                {/* แถวบน: Tabs & Buttons */}
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
                                className={cn("w-4 h-4", loading && "animate-spin")}
                            />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* ค้นหาชื่อคนไข้ */}
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="ค้นหาชื่อคนไข้..."
                            className="h-10 pl-9 font-normal"
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                        />
                    </div>

                    {/* Shadcn Date Picker */}
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
                    {selectedDate && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 px-2 justify-self-start lg:justify-self-center text-muted-foreground"
                            onClick={() => setSelectedDate(undefined)}
                        >
                            ล้างวันที่
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border border-border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="text-left pl-6 min-w-48 w-1/4">คนไข้</TableHead>
                            <TableHead className="text-center min-w-32 w-40">เบอร์โทร</TableHead>
                            <TableHead className="text-center w-32">วันที่</TableHead>
                            <TableHead className="text-center w-28">เวลา</TableHead>
                            <TableHead className="text-center w-32">สถานะ</TableHead>
                            <TableHead className="text-center w-40">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-32 bg-muted ml-6" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24 bg-muted mx-auto" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-7 w-28 rounded-full bg-muted mx-auto" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-7 w-20 rounded-full bg-muted mx-auto" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-7 w-24 rounded-full bg-muted mx-auto" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8 rounded-md bg-muted mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : list?.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-10 text-muted-foreground"
                                >
                                    ไม่พบข้อมูลการจอง
                                </TableCell>
                            </TableRow>
                        ) : (
                            list?.data.map((l) => (
                                <TableRow key={l.id}>
                                    <TableCell className="text-left pl-6 font-medium">{l.patientName}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">{l.patientPhone || "-"}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                        <Badge
                                            variant="secondary"
                                            className="border-emerald-900 bg-emerald-50 text-emerald-900"
                                        >
                                            {l.date
                                                ? format(parseISO(l.datetime), "dd/MM/yyyy", {
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
                                            {l.time}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                l.status === "CONFIRMED" && "text-blue-600 border-blue-600",
                                                l.status === "COMPLETED" && "text-green-600 border-green-600",
                                                l.status === "CANCELLED" && "text-red-600 border-red-600"
                                            )}
                                        >
                                            {l.status === "CONFIRMED" && "รอดำเนินการ"}
                                            {l.status === "COMPLETED" && "สำเร็จ"}
                                            {l.status === "CANCELLED" && "ยกเลิก"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {l.status === "CONFIRMED" ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => router.push(`/med-assist/treatment/new?appointmentId=${l.id}&patientId=${l.patientId}`)}
                                                    className="h-8"
                                                    title="จัดการข้อมูล"
                                                >
                                                    จัดการ
                                                </Button>
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 w-full">
                <p className="text-xs text-muted-foreground font-medium">
                    หน้า {currentPage} จาก {totalPages} (รวม{" "}
                    {list?.pagination?.total || 0} รายการ)
                </p>

                <div className="w-full sm:w-auto flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            {/* prev button */}
                            <PaginationItem>
                                <PaginationPrevious
                                    className={cn(
                                        "cursor-pointer",
                                        currentPage === 1 && "pointer-events-none opacity-40",
                                    )}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                />
                            </PaginationItem>

                            {/* page number */}
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

                            {/* next button */}
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
};

export default MedAssistAppointmentPage;
