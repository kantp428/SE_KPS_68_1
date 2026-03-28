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
import { useService } from "@/hooks/use-service";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ServicePage = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const [nameSearch, setNameSearch] = useState("");

  const debouncedNameSearch = useDebounce(nameSearch, 500);
  const { list, loading, fetchList, deleteService } = useService(
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
      await deleteService(id);
      toast.success("ลบข้อมูลสำเร็จ", {
        description: "ข้อมูลบริการถูกลบเรียบร้อยแล้ว",
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
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        ข้อมูลบริการ
      </h1>

      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="ค้นหาชื่อบริการ..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="h-10 transition-all focus-visible:ring-1"
          />
        </div>

        <Button onClick={() => router.push("/med-assist/service/new")}>
          + เพิ่มบริการใหม่
        </Button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-30">ชื่อบริการ</TableHead>
              <TableHead className="hidden text-center sm:table-cell">
                ราคา (บาท)
              </TableHead>
              <TableHead className="hidden text-center sm:table-cell">
                ระยะเวลา (นาที)
              </TableHead>
              <TableHead className="hidden w-50 text-center sm:table-cell">
                สถานะ
              </TableHead>
              <TableHead className="w-20 text-center sm:w-25">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-37.5 bg-muted" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="mx-auto h-5 w-20 bg-muted" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="mx-auto h-5 w-20 bg-muted" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex justify-center">
                      <Skeleton className="h-7 w-25 rounded-full bg-muted" />
                    </div>
                  </TableCell>
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
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูลบริการ
                </TableCell>
              </TableRow>
            ) : (
              list?.data.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell className="hidden text-center sm:table-cell">
                    {parseFloat(service.price).toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="hidden text-center sm:table-cell">
                    {service.duration_minute}
                  </TableCell>
                  <TableCell className="hidden text-center sm:table-cell">
                    <div
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs",
                        service.status === "AVAILABLE"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-red-600 bg-red-50 text-red-700",
                      )}
                    >
                      {statusThaiFormat(service.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/med-assist/service/${service.id}`)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        setDeleteTargetId(service.id);
                        setTempName(service.name);
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
          หน้า {currentPage} จาก {totalPages} (รวม {list?.pagination?.total || 0}{" "}
          รายการ)
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <PaginationItem key={num} className="cursor-pointer">
                  <PaginationLink
                    isActive={currentPage === num}
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ))}

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
            description={`คุณต้องการลบบริการ "${tempName ?? ""}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
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

export default ServicePage;
