"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { useServiceOptions } from "@/hooks/useServiceOptions";
import { useTreatment, ValidStatus } from "@/hooks/useTreatment";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import {
  BriefcaseMedical,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ClipboardPlus,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TreatmentPage = () => {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [tab, setTab] = useState<ValidStatus>("IN_PROGRESS");

  // Search States
  const [nameSearch, setNameSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [openService, setOpenService] = useState(false);

  const toggleService = (value: number) => {
    setSelectedServices((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );
  };

  const debouncedNameSearch = useDebounce(nameSearch, 500);
  const debouncedServiceSearch = useDebounce(serviceSearch, 300);
  const selectedDateParam = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;
  const { list, loading, fetchList } = useTreatment(
    currentPage,
    limit,
    tab,
    debouncedNameSearch,
    "/treatment/med-assist",
    selectedServices,
    selectedDateParam,
  );

  const { options: serviceOptions, loading: serviceOptionsLoading } =
    useServiceOptions(debouncedServiceSearch, 10, 1);

  const handleRefresh = async () => {
    try {
      await fetchList();
      toast.success("อัปเดตข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      toast.error("รีเฟรชล้มเหลว");
    }
  };

  const totalPages = list?.pagination?.totalPages || 1;

  return (
    <div className="space-y-4 p-6">
      <h1 className="font-sans text-2xl font-bold tracking-tight">
        ข้อมูลการบำบัด
      </h1>

      <div className="flex flex-col gap-4">
        {/* แถวบน: Tabs & Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as ValidStatus);
              setCurrentPage(1);
              setServiceSearch("");
            }}
            className="w-full lg:w-auto"
          >
            <TabsList>
              <TabsTrigger value="IN_PROGRESS">กำลังดำเนินการ</TabsTrigger>
              <TabsTrigger value="COMPLETED">ดำเนินการสำเร็จ</TabsTrigger>
              <TabsTrigger value="FOLLOW_UP">เฝ้าติดตาม</TabsTrigger>
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
            <Button onClick={() => router.push("/med-assist/room/new")}>
              + เพิ่มการบำบัดใหม่
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

          {/* แสดงเฉพาะ COMPLETE และ FOLLOW_UP */}
          {(tab === "COMPLETED" || tab === "FOLLOW_UP") && (
            <>
              {/* Multi-select Dropdown สำหรับบริการ */}
              <div className="flex items-center gap-2">
                <Popover open={openService} onOpenChange={setOpenService}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-10 w-full justify-between font-normal"
                    >
                      <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
                        <BriefcaseMedical className="text-muted-foreground h-4 w-4 shrink-0" />
                        {selectedServices.length > 0 ? (
                          selectedServices.map((val) => (
                            <Badge
                              key={val}
                              variant="secondary"
                              className="mr-1 shrink-0 font-normal"
                            >
                              {
                                serviceOptions.find((s) => s.value === val)
                                  ?.label
                              }
                            </Badge>
                          ))
                        ) : (
                          <span className="truncate text-muted-foreground">
                            เลือกบริการ...
                          </span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Search service..."
                        value={serviceSearch}
                        onValueChange={setServiceSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {serviceOptionsLoading
                            ? "Loading services..."
                            : "No service found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {serviceOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.label}
                              onSelect={() => toggleService(option.value)}
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selectedServices.includes(option.value)
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible",
                                )}
                              >
                                <Check className={cn("h-4 w-4")} />
                              </div>
                              {option.label}
                            </CommandItem>
                          ))}
                          {selectedServices.length > 0 && (
                            <CommandItem
                              onSelect={() => {
                                setSelectedServices([]);
                                setServiceSearch("");
                              }}
                            >
                              Clear all
                            </CommandItem>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedServices.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedServices([]);
                      setServiceSearch("");
                    }}
                  >
                    Clear all
                  </Button>
                )}
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
            </>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center min-w-30">คนไข้</TableHead>
              <TableHead className="text-center min-w-30">แพทย์</TableHead>
              <TableHead className="text-center min-w-30">บริการ</TableHead>
              <TableHead className="text-center min-w-30">ห้อง</TableHead>
              <TableHead className="w-28 text-center">เวลาเริ่ม</TableHead>
              {tab === "IN_PROGRESS" && (
                <TableHead className="w-28 text-center">
                  เวลาคาดว่าจะจบ
                </TableHead>
              )}
              {tab !== "IN_PROGRESS" && (
                <>
                  <TableHead className="w-28 text-center">เวลาจบ</TableHead>
                </>
              )}
              <TableHead className="w-32 text-center">วันที่</TableHead>
              <TableHead className="hidden sm:table-cell w-50 text-center">
                ข้อมูลการตรวจ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-5 w-37.5 bg-muted" />
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <Skeleton className="h-7 w-25 rounded-full bg-muted" />
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
                  colSpan={7}
                  className="text-center py-10 text-muted-foreground"
                >
                  ไม่พบข้อมูลการบำบัด
                </TableCell>
              </TableRow>
            ) : (
              list?.data.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.patientName}</TableCell>
                  <TableCell>{l.doctorName}</TableCell>
                  <TableCell>{l.serviceName}</TableCell>
                  <TableCell>{l.roomName}</TableCell>
                  <TableCell className="w-28 text-center whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="border-blue-950 bg-blue-50 text-blue-900"
                    >
                      {l.startAt}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-28 text-center whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="border-blue-950 bg-blue-50 text-blue-900"
                    >
                      {l.endAt}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-32 text-center whitespace-nowrap">
                    <Badge
                      variant="secondary"
                      className="border-emerald-900 bg-emerald-50 text-emerald-900"
                    >
                      {l.date
                        ? format(parseISO(l.date), "dd/MM/yyyy", {
                            locale: th,
                          })
                        : "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {}}
                          >
                            <ClipboardPlus className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>รายละเอียดการตรวจ</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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

export default TreatmentPage;
