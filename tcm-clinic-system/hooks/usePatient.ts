import { useCallback, useEffect, useState } from "react";
import { gender_enum, blood_group_enum } from "@prisma/client";

export type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  thai_id: string;
  birthdate: string | null;
  gender: gender_enum;
  phone_number: string;
  blood_group: blood_group_enum;
  chronic_disease: string | null;
  account_id: number | null;
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
