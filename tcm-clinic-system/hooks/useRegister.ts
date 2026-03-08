"use client";

import { handleException } from "@/app/utils/handleException";
import { RegisterFormValues } from "@/types/auth";
import axios from "axios";
import { useState } from "react";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const registerUser = (payload: RegisterFormValues) => api.post("/auth/register", payload);

export function useRegister() {
    const [loading, setLoading] = useState(false);

    const register = async (payload: RegisterFormValues) => {
        try {
            setLoading(true);
            const res = await registerUser(payload);
            return res.data;
        } catch (err: unknown) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        register,
    };
}
