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
import { useMedicine } from "@/hooks/useMedicine";
import { cn } from "@/lib/utils";
import { Medicine } from "@/types/medicine";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const MedicinePage = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const debouncedNameSearch = useDebounce(nameSearch, 500);

  const { list, loading, fetchList, deleteMedicine } = useMedicine(
    currentPage,
    limit,
    debouncedNameSearch,
  );

  const totalPages = list?.pagination?.totalPages || 1;

  function statusThaiFormat(status: string) {
    if (status === "AVAILABLE") {
      return "เปิดใช้งาน";
    }

    return "ปิดใช้งาน";
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMedicine(id);
      toast.success("ลบข้อมูลสำเร็จ", {
        description: "ข้อมูลยาถูกลบเรียบร้อยแล้ว",
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

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="ค้นหาชื่อยา..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="h-10 focus-visible:ring-1 transition-all"
          />
        </div>

        <Button onClick={() => router.push("/med-assist/medicine/new")}>
          + เพิ่มยาใหม่
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-50">ชื่อยา</TableHead>
              <TableHead className="hidden md:table-cell">คำอธิบาย</TableHead>
              <TableHead className="w-25 text-right">ราคา</TableHead>
              <TableHead className="w-30 text-center">สถานะ</TableHead>
              <TableHead className="w-25 text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-5 w-16" />
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="mx-auto h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : list?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลยา
                </TableCell>
              </TableRow>
            ) : (
              list?.data.map((item: Medicine) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {item.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.price).toLocaleString()} บาท
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs",
                        item.status === "AVAILABLE"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-red-600 bg-red-50 text-red-700",
                      )}
                    >
                      {statusThaiFormat(item.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/med-assist/medicine/${item.id}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        setDeleteTargetId(item.id);
                        setTempName(item.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
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

          <ConfirmDialog
            open={!!deleteTargetId}
            onOpenChange={(open) => {
              if (!open) {
                setDeleteTargetId(null);
              }
            }}
            title="ยืนยันการลบข้อมูล?"
            description={`คุณต้องการลบยา "${tempName}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
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

export default MedicinePage;
