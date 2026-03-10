"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface DoctorTreatmentItem {
  id: number;
  healthProfileId: number;
  patientName: string;
  doctorName: string;
  serviceName: string;
  serviceTime: number;
  roomName: string;
  date: string;
  startAt: string;
  endAt: string;
  status: "IN_PROGRESS" | "COMPLETED"; // ปรับตาม treatment_status_enum
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseDoctorTreatmentReturn {
  data: DoctorTreatmentItem[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDoctorTreatment(
  staffId: number,
  page = 1,
  limit = 10,
  name?: string,
  statusTab: string = "IN_PROGRESS", // รับสถานะจาก Tabs UI
): UseDoctorTreatmentReturn {
  const [data, setData] = useState<DoctorTreatmentItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((p) => p + 1), []);

  useEffect(() => {
    if (!staffId) return;
    const controller = new AbortController();

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // กำหนด Logic ของ Params ตาม Tab ที่เลือก
        const isObserveMode = statusTab === "OBSERVE";

        const { data: res } = await axios.get("/api/treatment/med-assist", {
          params: {
            page,
            limit,
            staffId,
            status: "IN_PROGRESS", // ทั้งสองสถานะยังถือว่าอยู่ในขั้นตอนการดำเนินงานใน DB
            isObserve: isObserveMode,
            // หากเป็น Observe ให้ล็อค Service เป็น 1 (Initial) หากเป็น In Progress อาจจะดูทั้งหมด
            ...(isObserveMode ? { serviceIds: "1" } : {}),
            ...(name ? { name } : {}),
          },
          signal: controller.signal,
        });

        setData(res.data || []);
        setPagination(res.pagination || null);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(
          axios.isAxiosError(err)
            ? (err.response?.data?.message ?? "โหลดข้อมูลล้มเหลว")
            : "เกิดข้อผิดพลาดในการดึงข้อมูล",
        );
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => controller.abort();
    // เพิ่ม statusTab ใน dependency array เพื่อให้ fetch ใหม่เมื่อเปลี่ยน tab
  }, [staffId, page, limit, name, trigger, statusTab]);

  return { data, pagination, loading, error, refetch };
}
