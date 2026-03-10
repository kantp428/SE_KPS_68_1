"use client";

import { handleException } from "@/app/utils/handleException";
import {
  Treatment,
  TreatmentFormValues,
  TreatmentList,
} from "@/types/treatment";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

/* ===============================
   Axios instance
================================ */
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export type ValidStatus = "IN_PROGRESS" | "COMPLETED" | "FOLLOW_UP";

/* ===============================
   API functions (pure)
================================ */
export const getTreatmentList = (
  page = 1,
  limit = 10,
  status?: ValidStatus,
  search?: string,
  listEndpoint = "/treatment",
  serviceIds?: number[],
  date?: string,
) =>
  api.get<TreatmentList>(listEndpoint, {
    params: {
      page,
      limit,
      ...(status ? { status: status } : {}),
      ...(search ? { name: search } : {}),
      ...(serviceIds && serviceIds.length > 0
        ? { serviceIds: serviceIds.join(",") }
        : {}),
      ...(date ? { date } : {}),
    },
  });

export const getTreatmentById = (id: number) =>
  api.get<Treatment>(`/treatment/${id}`);

export const createTreatment = (payload: TreatmentFormValues) =>
  api.post("/treatment", payload);

export const updateTreatment = (id: number, payload: TreatmentFormValues) =>
  api.patch(`/treatment/${id}`, payload);

/* ===============================
   Hook (stateful)
================================ */
export function useTreatment(
  page = 1,
  limit = 10,
  status?: ValidStatus,
  search?: string,
  listEndpoint = "/treatment",
  serviceIds?: number[],
  date?: string,
) {
  const [list, setList] = useState<TreatmentList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTreatmentList(
        page,
        limit,
        status,
        search,
        listEndpoint,
        serviceIds,
        date,
      );
      setList(res.data);
    } catch (err: unknown) {
      setError(handleException(err, "Failed to fetch treatment list"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search, listEndpoint, serviceIds, date]);

  const fetchOne = async (id: number) => {
    try {
      setLoading(true);
      const res = await getTreatmentById(id);
      return res.data;
    } catch (err: unknown) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    list,
    loading,
    error,
    fetchList,
    fetchOne,
    createTreatment,
    updateTreatment,
  };
}
