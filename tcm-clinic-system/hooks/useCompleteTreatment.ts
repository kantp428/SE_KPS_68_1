import { useState } from "react";
import axios from "axios";

interface CompleteTreatmentResponse {
  message: string;
  id: number;
  status: string;
}

interface UseCompleteTreatmentReturn {
  complete: (id: number) => Promise<CompleteTreatmentResponse>;
  loading: boolean;
  error: string | null;
}

export function useCompleteTreatment(): UseCompleteTreatmentReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch<CompleteTreatmentResponse>(
        `/api/treatment/${id}`,
      );
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "ไม่สามารถอัปเดตสถานะการรักษาได้")
        : "เกิดข้อผิดพลาด";

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { complete, loading, error };
}
