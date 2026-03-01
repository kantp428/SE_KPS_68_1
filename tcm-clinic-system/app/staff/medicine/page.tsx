"use client";
import { handleException } from "@/app/utils/handleException";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useRoom } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const RoomPage = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");

  const [nameSearch, setNameSearch] = useState("");
  const debouncedNameSearch = useDebounce(nameSearch, 500);

  const { list, loading, fetchList, deleteRoom } = useRoom(
    currentPage,
    limit,
    debouncedNameSearch,
  );

  const totalPages = list?.pagination?.totalPages || 1;

  function statusThaiFormat(status: string) {
    if (status === "AVAILABLE") {
      return "เปิดใช้งาน";
    } else {
      return "ปิดใช้งาน";
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRoom(id);
      toast.success("ลบข้อมูลสำเร็จ", {
        description: "ข้อมูลห้องถูกลบเรียบร้อยแล้ว",
      });
      fetchList();
    } catch (e: unknown) {
      const errorMessage = handleException(e, "เกิดข้อผิดพลาด");
      toast.error("ลบข้อมูลไม่สำเร็จ", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">ข้อมูลยา</h1>

      {/* --- Filters Section --- */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="ค้นหาชื่อห้อง..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="h-10 focus-visible:ring-1 transition-all"
          />
        </div>

        {/* เพิ่มปุ่มนี้เข้าไป */}
        <Button onClick={() => router.push("/staff/room/new")}>
          + เพิ่มห้องใหม่
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-30">ชื่อห้อง</TableHead>
              <TableHead className="hidden sm:table-cell w-50 text-center">
                สถานะ
              </TableHead>
              <TableHead className="w-20 sm:w-25 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // แสดง Skeleton จำนวน 5 แถวระหว่างรอข้อมูล
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {/* ชื่อห้อง */}
                  <TableCell>
                    <Skeleton className="h-5 w-37.5 bg-muted" />
                  </TableCell>
                  {/* สถานะห้อง (จัดกลาง) */}
                  <TableCell className="flex justify-center">
                    <Skeleton className="h-7 w-25 rounded-full bg-muted" />
                  </TableCell>
                  {/* ปุ่มจัดการ (จัดกลาง) */}
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-md bg-muted" />
                      <Skeleton className="h-8 w-8 rounded-md bg-muted" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : list?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-10 text-muted-foreground"
                >
                  ไม่พบข้อมูลห้อง
                </TableCell>
              </TableRow>
            ) : (
              list?.data.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.name}</TableCell>
                  <TableCell className="text-center">
                    <div
                      className={cn(
                        "inline-flex px-3 py-1 rounded-full text-xs border",
                        l.status === "AVAILABLE"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-red-600 bg-red-50 text-red-700",
                      )}
                    >
                      {statusThaiFormat(l.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {/* ปุ่มแก้ไข */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => router.push(`/staff/room/${l.id}`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {/* ปุ่มลบ - เปลี่ยนมาเรียก setDeleteTarget */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        setDeleteTargetId(l.id);
                        setTempName(l.name);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

          <ConfirmDialog
            open={!!deleteTargetId}
            onOpenChange={(open) => {
              if (!open) setDeleteTargetId(null);
            }}
            title="ยืนยันการลบข้อมูล?"
            description={`คุณต้องการลบห้อง "${tempName ?? ""}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
            confirmText="ลบข้อมูล"
            isDestructive={true}
            onConfirm={() => {
              if (deleteTargetId) {
                handleDelete(deleteTargetId);
                setDeleteTargetId(null);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
