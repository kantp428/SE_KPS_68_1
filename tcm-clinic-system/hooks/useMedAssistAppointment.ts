"use client";

import { handleException } from "@/app/utils/handleException";
import { MedAssistAppointmentListResponse } from "@/types/appointment";
import { appointment_status_enum } from "@prisma/client";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

export function useMedAssistAppointment(
    page: number,
    limit: number,
    status: string,
    nameSearch: string,
    dateSearch?: string
) {
    const [list, setList] = useState<MedAssistAppointmentListResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchList = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status ? { status } : {}),
                ...(nameSearch ? { name: nameSearch } : {}),
                ...(dateSearch ? { date: dateSearch } : {}),
            });

            const res = await api.get<MedAssistAppointmentListResponse>(
                `/med-assist/appointment?${params.toString()}`
            );
            setList(res.data);
        } catch (err: unknown) {
            const errorMsg = handleException(err, "Failed to fetch appointments");
            setError(errorMsg);
            console.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [page, limit, status, nameSearch, dateSearch]);

    // const updateStatus = async (id: number, newStatus: appointment_status_enum) => {
    //     try {
    //         setLoading(true);
    //         setError(null);
    //         await api.patch(`/med-assist/appointment/${id}`, { status: newStatus });
    //         await fetchList(); // Refresh the list after update
    //         return true;
    //     } catch (err: unknown) {
    //         const errorMsg = handleException(err, "Failed to update appointment status");
    //         setError(errorMsg);
    //         console.error(errorMsg);
    //         throw err;
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    return { list, loading, error, fetchList, //updateStatus 
    };
}
