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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { UserPlus, Edit2 } from "lucide-react";
import { usePatient } from "@/hooks/usePatient";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export default function PatientsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [nameSearch, setNameSearch] = useState("");
  const debouncedNameSearch = useDebounce(nameSearch, 500);

  const { list, loading } = usePatient(currentPage, limit, debouncedNameSearch);

  const totalPages = list?.pagination?.totalPages || 1;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายชื่อคนไข้</h1>
          <p className="text-muted-foreground mt-2">
            จัดการข้อมูลพื้นฐานและประวัติการรักษาของคนไข้ทั้งหมด
          </p>
        </div>
        <Link href="/med-assist/patients/create">
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            ลงทะเบียนคนไข้ใหม่
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="ค้นหาด้วยชื่อ นามสกุล หรือเลขบัตรประชาชน..."
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
              <TableHead>เลขบัตรประชาชน</TableHead>
              <TableHead>วันเกิด</TableHead>
              <TableHead>เพศ</TableHead>
              <TableHead>เบอร์โทรศัพท์</TableHead>
              <TableHead>หมู่เลือด</TableHead>
              <TableHead>โรคประจำตัว</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
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
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : list?.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  ยังไม่มีข้อมูลคนไข้ในระบบ
                </TableCell>
              </TableRow>
            ) : (
              list?.data.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.first_name} {patient.last_name}
                  </TableCell>
                  <TableCell>{patient.thai_id}</TableCell>
                  <TableCell>
                    {patient.birthdate
                      ? new Date(patient.birthdate).toLocaleDateString("th-TH")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {patient.gender === "MALE"
                      ? "ชาย"
                      : patient.gender === "FEMALE"
                        ? "หญิง"
                        : patient.gender}
                  </TableCell>
                  <TableCell>{patient.phone_number}</TableCell>
                  <TableCell>{patient.blood_group}</TableCell>
                  <TableCell>{patient.chronic_disease || "ไม่มี"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/med-assist/patients/${patient.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 ml-auto"
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
