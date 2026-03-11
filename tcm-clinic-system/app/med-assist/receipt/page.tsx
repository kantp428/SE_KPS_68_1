"use client";

import React from 'react';
import ReceiptCard from '@/components/receipt/ReceiptCard';

export default function ReceiptPage() {
  const mockReceiptData = {
    receiptNumber: "0001",
    date: new Date().toLocaleDateString('th-TH', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }),
    patientName: "คุณ กฤษณัส รักษาดี",
    items: [
      { name: "ค่าตรวจวินิจฉัยโรคเบื้องต้น", qty: 1, price: 500 },
      { name: "ยาสมุนไพรจีน สูตรบำรุงกำลัง (ชุด)", qty: 2, price: 350 },
      { name: "ค่าบริการฝังเข็ม", qty: 1, price: 800 },
    ],
    total: 2000,
  };

  // ฟังก์ชันสั่งพิมพ์
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* ส่วนควบคุม (ปุ่มต่างๆ) จะถูกซ่อนตอนพิมพ์ด้วยคลาส hide-on-print */}
      <div className="max-w-2xl mx-auto mb-6 flex justify-between items-center hide-on-print">
        <h1 className="text-2xl font-bold text-gray-800">จัดการใบเสร็จรับเงิน</h1>
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition-colors"
        >
          🖨️ พิมพ์ใบเสร็จ
        </button>
      </div>

      {/* เรียกใช้งาน Component ใบเสร็จ */}
      <ReceiptCard data={mockReceiptData} />
    </div>
  );
}