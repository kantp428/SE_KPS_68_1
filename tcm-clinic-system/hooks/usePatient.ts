import { useCallback, useEffect, useState } from "react";

export type Patient = {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  birthdate: string | null;
  gender: string;
  thai_id: string;
  phone_number: string;
  blood_group: string;
  chronic_disease: string | null;
  created_at: string;
  updated_at: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PatientListResponse = {
  data: Patient[];
  pagination: PaginationMeta;
};

export function usePatient(page: number, limit: number, search?: string) {
  const [list, setList] = useState<PatientListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/patients", window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", limit.toString());
      if (search) {
        url.searchParams.set("search", search);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch patients");

      const data = await res.json();
      setList(data);
    } catch (error) {
      console.error(error);
      setList(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { list, loading, fetchList };
}
