import { useState } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TongueDiagnosis {
  color?: string;
  coating?: string;
  moisture?: string;
  shape?: string;
  cracks?: boolean;
  toothMarks?: boolean;
}

export interface UpdateHealthProfilePayload {
  weight?: number;
  height?: number;
  bp?: number;
  symptoms?: string;
  vitals?: {
    temperature?: number | null;
    pulse?: number | null;
    respiratoryRate?: number | null;
    oxygenSaturation?: number | null;
    tongue?: TongueDiagnosis | null;
  };
}

interface UseUpdateHealthProfileReturn {
  update: (id: number, payload: UpdateHealthProfilePayload) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUpdateHealthProfile(): UseUpdateHealthProfileReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, payload: UpdateHealthProfilePayload) => {
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/api/health-profile/${id}`, payload);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message ?? "ไม่สามารถอัปเดตข้อมูลได้";
        setError(msg);
        throw new Error(msg);
      }
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
