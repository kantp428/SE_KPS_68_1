"use client";

import { handleException } from "@/app/utils/handleException";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export interface ServiceOption {
  value: number;
  label: string;
}

interface ServiceOptionResponse {
  data: ServiceOption[];
}

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getServiceOptions = (search?: string, limit = 10, page = 1) =>
  api.get<ServiceOptionResponse>("/service/options", {
    params: {
      ...(search ? { search } : {}),
      limit,
      page,
    },
  });

export function useServiceOptions(search?: string, limit = 10, page = 1) {
  const [options, setOptions] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getServiceOptions(search, limit, page);
      setOptions(res.data.data ?? []);
    } catch (err: unknown) {
      setError(handleException(err, "Failed to fetch service options"));
    } finally {
      setLoading(false);
    }
  }, [search, limit, page]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,
    loading,
    error,
    fetchOptions,
  };
}
