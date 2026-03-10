import { useCallback, useEffect, useState } from "react";
import { gender_enum, staff_role_enum } from "@prisma/client";

export type Staff = {
  id: number;
  first_name: string;
  last_name: string;
  gender: gender_enum;
  phone_number: string;
  staff_role: staff_role_enum;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type StaffListResponse = {
  data: Staff[];
  pagination: PaginationMeta;
};

export function useStaff(page: number, limit: number, search?: string) {
  const [list, setList] = useState<StaffListResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/staff", window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", limit.toString());
      if (search) {
        url.searchParams.set("search", search);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch staff");

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
