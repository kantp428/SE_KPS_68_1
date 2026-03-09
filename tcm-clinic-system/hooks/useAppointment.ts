"use client";

import { handleException } from "@/app/utils/handleException";
import { BookAppointmentPayload, GetSlotsResponse } from "@/types/appointment";
import axios from "axios";
import { useCallback, useState } from "react";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getAvailableSlots = (date: string) => api.get<GetSlotsResponse>(`/patient/appointment/slots?date=${date}`);
export const createAppointment = (payload: BookAppointmentPayload) => api.post("/patient/appointment", payload);

export function useAppointment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSlots = useCallback(async (date: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAvailableSlots(date);
            return res.data;
        } catch (err: unknown) {
            const errorMsg = handleException(err, "Failed to fetch slots");
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const bookAppointment = async (payload: BookAppointmentPayload) => {
        try {
            setLoading(true);
            setError(null);
            const res = await createAppointment(payload);
            return res.data;
        } catch (err: unknown) {
            const errorMsg = handleException(err, "Failed to book appointment");
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchSlots,
        bookAppointment,
    };
}
