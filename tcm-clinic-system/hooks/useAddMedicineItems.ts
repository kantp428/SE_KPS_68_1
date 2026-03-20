import { useState } from "react";
import axios from "axios";

export interface MedicineItemPayload {
  medId: number;
  quantity: number;
}

export interface AddMedicineItemsPayload {
  invoiceId: number;
  items: MedicineItemPayload[];
}

export interface AddMedicineItemsResponse {
  success: boolean;
  message: string;
  addedAmount: number;
}

interface UseAddMedicineItemsReturn {
  submit: (
    payload: AddMedicineItemsPayload,
  ) => Promise<AddMedicineItemsResponse>;
  loading: boolean;
  error: string | null;
}

export function useAddMedicineItems(): UseAddMedicineItemsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: AddMedicineItemsPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AddMedicineItemsResponse>(
        "/api/invoice-med",
        payload,
      );
      return response.data;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "ไม่สามารถบันทึกการจ่ายยาได้")
        : "เกิดข้อผิดพลาด";

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
