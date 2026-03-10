"use client";

import { handleException } from "@/app/utils/handleException";
import { GetSlotsResponse } from "@/types/appointment";
import axios from "axios";
import { useCallback, useState } from "react";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface BookMedAssistAppointmentPayload {
    patientId: number;
    date: string; // yyyy-mm-dd
    time: string; // "09:00"
}

export const getMedAssistSlots = (date: string) => api.get<GetSlotsResponse>(`/med-assist/appointment/slots?date=${date}`);
export const createMedAssistAppointment = (payload: BookMedAssistAppointmentPayload) => api.post("/med-assist/appointment/book", payload);

export function useMedAssistAppointmentCreate() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSlots = useCallback(async (date: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getMedAssistSlots(date);
            return res.data;
        } catch (err: unknown) {
            const errorMsg = handleException(err, "Failed to fetch slots");
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const bookAppointment = async (payload: BookMedAssistAppointmentPayload) => {
        try {
            setLoading(true);
            setError(null);
            const res = await createMedAssistAppointment(payload);
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
