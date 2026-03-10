import { useState, useEffect, useCallback } from "react";

export const useMedicine = (page = 1, limit = 10, name = "") => {
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medicine?page=${page}&limit=${limit}&name=${name}`);
      const data = await res.json();
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

  const fetchOne = async (id: number) => {
    const res = await fetch(`/api/medicine/${id}`);
    if (!res.ok) throw new Error("Failed to fetch medicine");
    return res.json();
  };

  const createMedicine = async (data: any) => {
    const res = await fetch("/api/medicine", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create medicine");
    return res.json();
  };

  const updateMedicine = async (id: number, data: any) => {
    const res = await fetch(`/api/medicine/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update medicine");
    return res.json();
  };

  const deleteMedicine = async (id: number) => {
    const res = await fetch(`/api/medicine/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete medicine");
    return res.json();
  };

  return { list, loading, fetchList, fetchOne, createMedicine, updateMedicine, deleteMedicine };
};