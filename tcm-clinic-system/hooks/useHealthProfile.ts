import { useState, useEffect } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TongueVitals {
  color?: string;
  shape?: string;
  coating?: string;
  moisture?: string;
  cracks?: boolean;
  toothMarks?: boolean;
}

export interface Vitals {
  temp?: number | null;
  pulse?: number | null;
  temperature?: number | null;
  respiratoryRate?: number | null;
  oxygenSaturation?: number | null;
  tongue?: TongueVitals | null;
}

export interface HealthProfile {
  id: number;
  patient_id: number;
  weight: string;
  height: string;
  bp: number;
  vitals: Vitals;
  symptoms: string;
  date_time: string;
}

interface UseHealthProfileReturn {
  profile: HealthProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHealthProfile(
  id: number | null,
  enabled = true,
): UseHealthProfileReturn {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger((prev) => prev + 1);

  useEffect(() => {
    if (id === null || !enabled) return;

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setProfile(null);

      try {
        const { data } = await axios.get<HealthProfile>(
          `/api/health-profile/${id}`,
          { signal: controller.signal },
        );
        setProfile(data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "ไม่สามารถโหลดข้อมูลได้");
        } else {
          setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [id, enabled, trigger]);

  return { profile, loading, error, refetch };
}
