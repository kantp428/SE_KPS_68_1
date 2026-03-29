"use client";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { useStaff } from "@/hooks/useStaff";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber } from "@/app/utils/formatPhoneNumber";
import { Badge } from "@/components/ui/badge";

export default function StaffListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [nameSearch, setNameSearch] = useState("");
  const debouncedNameSearch = useDebounce(nameSearch, 500);

  const { list, loading } = useStaff(currentPage, limit, debouncedNameSearch);

  const totalPages = list?.pagination?.totalPages || 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            จัดการข้อมูลพนักงาน
          </h1>
          <p className="text-muted-foreground mt-2">
            เรียกดูข้อมูลพนักงานและตำแหน่งในคลินิก
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 sm:mt-0">
        <div className="relative flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="ค้นหาด้วยชื่อ หรือ นามสกุล..."
            value={nameSearch}
            onChange={(e) => {
              setNameSearch(e.target.value);
              setCurrentPage(1); // Reset page on new search
            }}
          />
        </div>
        <Link href="/med-assist/staff/create">
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>เพิ่มพนักงาน</span>
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead className="text-center">ตำแหน่ง</TableHead>
              <TableHead className="text-center">เพศ</TableHead>
              <TableHead className="text-center">เบอร์โทรศัพท์</TableHead>
              <TableHead className="w-[150px] text-right">จัดการ</TableHead>
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
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : list?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  ยังไม่มีข้อมูลพนักงานในระบบ
                </TableCell>
              </TableRow>
            ) : (
              list?.data?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    {staff.first_name} {staff.last_name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "min-w-10 justify-center",
                        staff.staff_role === "DOCTOR"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-teal-100 text-teal-800",
                      )}
                    >
                      {staff.staff_role === "DOCTOR" ? "แพทย์" : "ผู้ช่วยแพทย์"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-10",
                        staff.gender === "MALE" &&
                          "border-blue-600 text-blue-600",
                        staff.gender === "FEMALE" &&
                          "border-red-600 text-red-600",
                      )}
                    >
                      {staff.gender === "MALE"
                        ? "ชาย"
                        : staff.gender === "FEMALE"
                          ? "หญิง"
                          : staff.gender}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatPhoneNumber(staff.phone_number)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/med-assist/staff/${staff.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 ml-auto"
                        title="แก้ไขข้อมูลพนักงาน"
                      >
                        <Edit2 className="w-4 h-4" />
                        แก้ไขข้อมูล
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && list?.data && list.data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 w-full mt-4">
          <p className="text-xs text-muted-foreground font-medium">
            หน้า {currentPage} จาก {totalPages} (รวม{" "}
            {list?.pagination?.total || 0} รายการ)
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
      )}
    </div>
  );
}
