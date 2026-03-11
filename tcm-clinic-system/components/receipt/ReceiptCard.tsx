// ตำแหน่ง: components/receipt/ReceiptCard.tsx
import React from 'react';


// กำหนดรูปร่างของข้อมูลที่จะส่งเข้ามา
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
  data: ReceiptData;
}

export default function ReceiptCard({ data }: ReceiptCardProps) {
  return (
    // id="printable-area" จะใช้สำหรับอ้างอิงตอนสั่งพิมพ์
    <div 
      id="printable-area" 
      className="bg-white text-black p-8 max-w-2xl mx-auto border shadow-sm rounded-md"
    >
      {/* ส่วนหัวใบเสร็จ */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">TCM Clinic</h1>
        <p className="text-sm text-gray-600">คลินิกการแพทย์แผนจีน (สมมติ)</p>
        <p className="text-sm text-gray-600">123 ถ.มาลัยแมน ต.กำแพงแสน อ.กำแพงแสน จ.นครปฐม 73140</p>
        <p className="text-sm text-gray-600">โทร: 012-345-6789</p>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold border-b-2 border-black inline-block pb-1">ใบเสร็จรับเงิน / Receipt</h2>
      </div>

      {/* ข้อมูลคนไข้และเอกสาร */}
      <div className="flex justify-between mb-6 text-sm">
        <div>
          <p className="mb-1"><span className="font-semibold">ชื่อคนไข้:</span> {data.patientName}</p>
        </div>
        <div className="text-right">
          <p className="mb-1"><span className="font-semibold">เลขที่ใบเสร็จ:</span> {data.receiptNumber}</p>
          <p className="mb-1"><span className="font-semibold">วันที่:</span> {data.date}</p>
        </div>
      </div>

      {/* ตารางรายการ */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-2 font-semibold">ลำดับ</th>
            <th className="text-left py-2 font-semibold">รายการ</th>
            <th className="text-center py-2 font-semibold">จำนวน</th>
            <th className="text-right py-2 font-semibold">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-3">{index + 1}</td>
              <td className="py-3">{item.name}</td>
              <td className="text-center py-3">{item.qty}</td>
              <td className="text-right py-3">{(item.price * item.qty).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* สรุปยอดเงิน */}
      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between font-bold text-sm border-t-2 border-black pt-2 whitespace-nowrap gap-4">
            <span>รวมเงินทั้งสิ้น:</span>
            <span>{data.total.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      {/* ลายเซ็น */}
      <div className="mt-16 flex justify-end">
        <div className="text-center w-48">
          <div className="border-b border-black mb-2 h-8"></div>
          <p className="text-sm">ผู้รับเงิน</p>
        </div>
      </div>
    </div>
  );
}