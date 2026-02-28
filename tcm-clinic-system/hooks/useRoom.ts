"use client";

import { handleException } from "@/app/utils/handleException";
import { Room, RoomFormValues, RoomList } from "@/types/room";
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
export const getRoomList = (page = 1, limit = 10, search?: string) =>
  api.get<RoomList>("/room", {
    params: {
      page,
      limit,
      ...(search ? { name: search } : {}),
    },
  });

export const getRoomById = (id: number) => api.get<Room>(`/room/${id}`);

export const createRoom = (payload: RoomFormValues) =>
  api.post("/room", payload);

export const updateRoom = (id: number, payload: RoomFormValues) =>
  api.patch(`/room/${id}`, payload);

export const deleteRoom = (id: number) => api.delete(`/room/${id}`);

/* ===============================
   Hook (stateful)
================================ */
export function useRoom(page = 1, limit = 10, search?: string) {
  const [list, setList] = useState<RoomList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRoomList(page, limit, search);
      setList(res.data);
    } catch (err: unknown) {
      setError(handleException(err, "Failed to fetch room list"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const fetchOne = async (id: number) => {
    try {
      setLoading(true);
      const res = await getRoomById(id);
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
    createRoom,
    updateRoom,
    deleteRoom,
  };
}
