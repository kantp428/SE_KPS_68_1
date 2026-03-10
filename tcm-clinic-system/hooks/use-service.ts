"use client";

import { handleException } from "@/app/utils/handleException";
import { Service, ServiceFormValues, ServiceList } from "@/types/service";
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

/* ===============================
   API functions (pure)
================================ */
export const getServiceList = (page = 1, limit = 10, search?: string) =>
  api.get<ServiceList>("/service", {
    params: {
      page,
      limit,
      ...(search ? { name: search } : {}),
    },
  });

export const getServiceById = (id: number) => api.get<Service>(`/service/${id}`);

export const createService = (payload: ServiceFormValues) =>
  api.post("/service", payload);

export const updateService = (id: number, payload: ServiceFormValues) =>
  api.patch(`/service/${id}`, payload);

export const deleteService = (id: number) => api.delete(`/service/${id}`);

/* ===============================
   Hook (stateful)
================================ */
export function useService(page = 1, limit = 10, search?: string) {
  const [list, setList] = useState<ServiceList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getServiceList(page, limit, search);
      setList(res.data);
    } catch (err: unknown) {
      setError(handleException(err, "Failed to fetch service list"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const fetchOne = async (id: number) => {
    try {
      setLoading(true);
      const res = await getServiceById(id);
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
    createService,
    updateService,
    deleteService,
  };
}