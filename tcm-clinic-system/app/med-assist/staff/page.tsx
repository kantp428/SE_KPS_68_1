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

export default function StaffListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [nameSearch, setNameSearch] = useState("");
  const debouncedNameSearch = useDebounce(nameSearch, 500);

  const { list, loading } = useStaff(
    currentPage,
    limit,
    debouncedNameSearch
  );

  const totalPages = list?.pagination?.totalPages || 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการข้อมูลพนักงาน</h1>
          <p className="text-muted-foreground mt-2">
            เรียกดูข้อมูลพนักงานและตำแหน่งในคลินิก
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
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
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>เพศ</TableHead>
              <TableHead>เบอร์โทรศัพท์</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : list?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  ยังไม่มีข้อมูลพนักงานในระบบ
                </TableCell>
              </TableRow>
            ) : (
              list?.data?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    {staff.first_name} {staff.last_name}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-semibold",
                      staff.staff_role === "DOCTOR" ? "bg-blue-100 text-blue-800" : "bg-teal-100 text-teal-800"
                    )}>
                      {staff.staff_role === "DOCTOR" ? "แพทย์" : "ผู้ช่วยแพทย์"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {staff.gender === "MALE" ? "ชาย" : staff.gender === "FEMALE" ? "หญิง" : staff.gender}
                  </TableCell>
                  <TableCell>{staff.phone_number}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && list?.data && list.data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 w-full mt-4">
          <p className="text-xs text-muted-foreground font-medium">
            หน้า {currentPage} จาก {totalPages} (รวม {list?.pagination?.total || 0} รายการ)
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    className={cn(
                      "cursor-pointer",
                      currentPage === 1 && "pointer-events-none opacity-40"
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
                      currentPage === totalPages && "pointer-events-none opacity-40"
                    )}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
