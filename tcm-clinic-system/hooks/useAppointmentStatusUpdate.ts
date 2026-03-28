"use client";

import { handleException } from "@/app/utils/handleException";
import {
  AppointmentStatusUpdate,
  AppointmentStatusUpdateResponse,
} from "@/types/appointment";
import axios from "axios";
import { useState } from "react";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

export function useAppointmentStatusUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAppointmentStatus = async (
    appointmentId: number,
    status: AppointmentStatusUpdate,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.patch<AppointmentStatusUpdateResponse>(
        `/med-assist/appointment/${appointmentId}`,
        { status },
      );

      return response.data;
    } catch (err: unknown) {
      const message = handleException(
        err,
        "ไม่สามารถอัปเดตสถานะการจองได้",
      );
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { updateAppointmentStatus, loading, error };
}
