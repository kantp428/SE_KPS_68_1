"use client";

import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import {
  ChevronRight,
  Clock,
  RefreshCcw,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctorTreatment } from "@/hooks/useDoctorTreatment";
import { cn } from "@/lib/utils";

const DoctorTreatmentPage = () => {
  const auth = useAuth();
  const staffId = auth.user?.staff?.id;

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [nameSearch, setNameSearch] = useState("");
  const [statusTab, setStatusTab] = useState<string>("OBSERVE");

  const debouncedName = useDebounce(nameSearch, 400);

  // console.log(staff);
  const { data, pagination, loading, refetch, error } = useDoctorTreatment(
    staffId ?? 0,
    currentPage,
    10,
    debouncedName,
    statusTab,
  );

  const totalPages = pagination?.totalPages ?? 1;

  const handleRefresh = async () => {
    try {
      refetch();
      toast.success("อัปเดตข้อมูลเรียบร้อย");
    } catch {
      toast.error("รีเฟรชล้มเหลว");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">การจัดการคนไข้</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-9"
        >
          <RefreshCcw
            className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
          />
          รีเฟรช
        </Button>
      </div>

      <Tabs
        defaultValue="OBSERVE"
        onValueChange={(val) => {
          setStatusTab(val);
          setCurrentPage(1);
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="OBSERVE">
              {/* <Clock className="h-4 w-4" /> */}
              ตรวจวินิจฉัย
            </TabsTrigger>
            <TabsTrigger value="IN_PROGRESS">
              {/* <Activity className="h-4 w-4" /> */}
              กำลังรักษา
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อคนไข้..."
              className="pl-9 h-9"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value={statusTab} className="mt-4 border-none p-0">
          <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="min-w-37.5">คนไข้</TableHead>
                  <TableHead className=" min-w-30">แพทย์</TableHead>
                  <TableHead className="text-center min-w-30">บริการ</TableHead>
                  <TableHead className="text-center min-w-25">ห้อง</TableHead>
                  <TableHead className="w-28 text-center">เวลาเริ่ม</TableHead>
                  <TableHead className="w-28 text-center text-blue-600">
                    คาดว่าจบ
                  </TableHead>
                  <TableHead className="w-32 text-center">วันที่</TableHead>

                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {auth.isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-24" />
                      </TableCell>

                      <TableCell />
                    </TableRow>
                  ))
                ) : !staffId ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 opacity-20" />
                        <p>ไม่พบข้อมูลบุคลากรของบัญชีที่ล็อกอินอยู่</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 opacity-20" />
                        <p>{error}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-5 w-24" />
                      </TableCell>

                      <TableCell />
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 opacity-20" />
                        <p>
                          ไม่พบข้อมูลคนไข้ในสถานะ{" "}
                          {statusTab === "OBSERVE" ? "รอตรวจ" : "กำลังรักษา"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => {
                        if (statusTab === "OBSERVE") {
                          router.push(`/doctor/treatment/observe/${item.id}`);
                        } else {
                          router.push(`/doctor/treatment/${item.id}`);
                        }
                      }}
                    >
                      <TableCell className="font-medium">
                        {item.patientName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.doctorName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-normal text-[11px]"
                        >
                          {item.serviceName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.roomName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 border-blue-100 font-normal"
                        >
                          {item.startAt}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-slate-50 text-slate-600 border-slate-100 font-normal"
                        >
                          {item.endAt || "--:--"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap text-sm">
                        {item.date
                          ? format(parseISO(item.date), "dd/MM/yyyy", {
                              locale: th,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-xs text-muted-foreground font-medium order-2 sm:order-1">
              หน้า {currentPage} จาก {totalPages} (รวม {pagination?.total || 0}{" "}
              รายการ)
            </p>

            <div className="order-1 sm:order-2">
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

                  {/* แสดงเลขหน้าแบบย่อ */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem
                        key={pageNum}
                        className="hidden md:inline-block"
                      >
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorTreatmentPage;
