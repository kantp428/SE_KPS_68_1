"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";

interface InvoiceItemDetail {
  name: string;
  qty: number;
  price: number;
  treatmentStatus: "IN_PROGRESS" | "COMPLETED" | null;
}

interface InvoiceDetailData {
  receiptNumber: string;
  date: string;
  time: string;
  patientName: string;
  items: InvoiceItemDetail[];
  total: number;
}

interface InProgressInvoiceDetailProps {
  id: string;
}

export default function InProgressInvoiceDetail({
  id,
}: InProgressInvoiceDetailProps) {
  const [data, setData] = useState<InvoiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/invoice/${id}`);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Failed to fetch invoice");
        }

        setData(json.data);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch invoice",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchInvoice();
  }, [id]);

  const progress = useMemo(() => {
    if (!data) return null;

    const treatmentItems = data.items.filter((item) => item.treatmentStatus);
    const completedCount = treatmentItems.filter(
      (item) => item.treatmentStatus === "COMPLETED",
    ).length;

    return {
      completedCount,
      totalCount: treatmentItems.length,
      canPay:
        treatmentItems.length > 0 && completedCount === treatmentItems.length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-6 text-center font-sans text-black shadow-sm">
        กำลังโหลดรายละเอียด...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-6 text-center font-sans text-red-600 shadow-sm">
        {error || "ไม่พบข้อมูล invoice"}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-lg border bg-white p-6 font-sans text-black shadow-sm">
      <div className="space-y-1 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold">รายละเอียดกำลังดำเนินการ</h2>
          <p className="text-sm text-muted-foreground">
            ติดตามสถานะ treatment ใน invoice นี้ก่อนชำระเงิน
          </p>
        </div>
        <p className="text-sm">
          <span className="font-medium">เลขที่ใบเสร็จ:</span> {data.receiptNumber}
        </p>
        <p className="text-sm">
          <span className="font-medium">คนไข้:</span> {data.patientName}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.date} {data.time} น.
        </p>
      </div>

      <div className="rounded-md border bg-slate-50 p-4">
        <p className="text-sm text-muted-foreground">สถานะรวม</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">
            เสร็จแล้ว {progress?.completedCount ?? 0}/{progress?.totalCount ?? 0} รายการ
          </p>
          <Badge
            variant="secondary"
            className={
              progress?.canPay
                ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                : "border-amber-900 bg-amber-50 text-amber-900"
            }
          >
            {progress?.canPay ? "พร้อมชำระ" : "ยังชำระไม่ได้"}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        {data.items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex flex-col gap-2 rounded-md border p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                จำนวน {item.qty} x {item.price.toLocaleString()} บาท
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold">
                {(item.qty * item.price).toLocaleString()} บาท
              </p>
              {item.treatmentStatus && (
                <Badge
                  variant="secondary"
                  className={
                    item.treatmentStatus === "COMPLETED"
                      ? "border-emerald-900 bg-emerald-50 text-emerald-900"
                      : "border-amber-900 bg-amber-50 text-amber-900"
                  }
                >
                  {item.treatmentStatus === "COMPLETED"
                    ? "เสร็จสิ้น"
                    : "กำลังดำเนินการ"}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t pt-4 text-sm">
        <span className="text-muted-foreground">ยอดรวม</span>
        <span className="text-lg font-semibold">{data.total.toLocaleString()} บาท</span>
      </div>
    </div>
  );
}
