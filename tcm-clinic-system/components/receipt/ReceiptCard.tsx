"use client";

import { useEffect, useState } from "react";

interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

interface ReceiptData {
  receiptNumber: string;
  date: string;
  patientName: string;
  items: ReceiptItem[];
  total: number;
}

interface ReceiptCardProps {
  id: string;
}

export default function ReceiptCard({ id }: ReceiptCardProps) {
  const [data, setData] = useState<ReceiptData | null>(null);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border bg-white p-8 text-center text-black shadow-sm">
        กำลังโหลดใบเสร็จ...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border bg-white p-8 text-center text-red-600 shadow-sm">
        {error || "ไม่พบข้อมูลใบเสร็จ"}
      </div>
    );
  }

  return (
    <div
      id="printable-area"
      className="mx-auto max-w-2xl rounded-md border bg-white p-8 text-black shadow-sm"
    >
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">TCM Clinic</h1>
        <p className="text-sm text-gray-600">คลินิกการแพทย์แผนจีน</p>
        <p className="text-sm text-gray-600">
          123 ถ.มาลัยแมน ต.กำแพงแสน อ.กำแพงแสน จ.นครปฐม 73140
        </p>
        <p className="text-sm text-gray-600">โทร: 012-345-6789</p>
      </div>

      <div className="mb-6 text-center">
        <h2 className="inline-block border-b-2 border-black pb-1 text-xl font-semibold">
          ใบเสร็จรับเงิน / Receipt
        </h2>
      </div>

      <div className="mb-6 flex justify-between text-sm">
        <div>
          <p className="mb-1">
            <span className="font-semibold">ชื่อคนไข้:</span> {data.patientName}
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1">
            <span className="font-semibold">เลขที่ใบเสร็จ:</span>{" "}
            {data.receiptNumber}
          </p>
          <p className="mb-1">
            <span className="font-semibold">วันที่:</span> {data.date}
          </p>
        </div>
      </div>

      <table className="mb-8 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="py-2 text-left font-semibold">ลำดับ</th>
            <th className="py-2 text-left font-semibold">รายการ</th>
            <th className="py-2 text-center font-semibold">จำนวน</th>
            <th className="py-2 text-right font-semibold">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={`${item.name}-${index}`} className="border-b border-gray-200">
              <td className="py-3">{index + 1}</td>
              <td className="py-3">{item.name}</td>
              <td className="py-3 text-center">{item.qty}</td>
              <td className="py-3 text-right">
                {(item.price * item.qty).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between gap-4 whitespace-nowrap border-t-2 border-black pt-2 text-sm font-bold">
            <span>รวมเงินทั้งสิ้น:</span>
            <span>{data.total.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      <div className="mt-16 flex justify-end">
        <div className="w-48 text-center">
          <div className="mb-2 h-8 border-b border-black"></div>
          <p className="text-sm">ผู้รับเงิน</p>
        </div>
      </div>
    </div>
  );
}
