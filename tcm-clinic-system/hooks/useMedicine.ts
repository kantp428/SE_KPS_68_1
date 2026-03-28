import { useState, useEffect, useCallback } from "react";
import { Medicine, MedicineFormValues } from "@/types/medicine";

interface MedicineListResponse {
  data: Medicine[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useMedicine = (page = 1, limit = 10, name = "") => {
  const [list, setList] = useState<MedicineListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medicine?page=${page}&limit=${limit}&name=${name}`);
      const data: MedicineListResponse = await res.json();
      setList(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, name]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchOne = async (id: number): Promise<Medicine> => {
    const res = await fetch(`/api/medicine/${id}`);
    if (!res.ok) throw new Error("Failed to fetch medicine");
    return res.json() as Promise<Medicine>;
  };

  const createMedicine = async (data: MedicineFormValues): Promise<Medicine> => {
    const res = await fetch("/api/medicine", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create medicine");
    return res.json() as Promise<Medicine>;
  };

  const updateMedicine = async (
    id: number,
    data: MedicineFormValues
  ): Promise<Medicine> => {
    const res = await fetch(`/api/medicine/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update medicine");
    return res.json() as Promise<Medicine>;
  };

  const deleteMedicine = async (
    id: number
  ): Promise<{ message: string }> => {
    const res = await fetch(`/api/medicine/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete medicine");
    return res.json() as Promise<{ message: string }>;
  };

  return { list, loading, fetchList, fetchOne, createMedicine, updateMedicine, deleteMedicine };
};
