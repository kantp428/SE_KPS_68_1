import { useState } from "react";
import axios from "axios";

export interface TreatmentItemPayload {
  serviceId: number;
  roomId: number;
}

export interface AddTreatmentItemsPayload {
  doctorId: number;
  patientId: number;
  healthProfileId: number;
  invoiceId: number;
  startAt: string;
  treatmentItems: TreatmentItemPayload[];
}

interface UseAddTreatmentItemsReturn {
  submit: (payload: AddTreatmentItemsPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useAddTreatmentItems(): UseAddTreatmentItemsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: AddTreatmentItemsPayload) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/treatment/doctor", payload);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "ไม่สามารถบันทึกได้")
        : "เกิดข้อผิดพลาด";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
