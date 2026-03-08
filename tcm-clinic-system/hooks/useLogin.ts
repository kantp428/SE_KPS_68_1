"use client";

import { handleException } from "@/app/utils/handleException";
import { AuthUser, LoginFormValues } from "@/types/auth";
import axios from "axios";
import { useCallback, useState } from "react";

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
export const loginUser = (payload: LoginFormValues) => api.post("/auth/login", payload);

export const logoutUser = () => api.post("/auth/logout");

export const getMe = () => api.get<AuthUser>("/auth/me");

/* ===============================
   Hook (stateful)
================================ */
export function useLogin() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMe = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getMe();
            setUser(res.data);
        } catch (err: unknown) {
            setError(handleException(err, "Failed to fetch user data"));
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (payload: LoginFormValues) => {
        try {
            setLoading(true);
            const res = await loginUser(payload);
            return res.data;
        } catch (err: unknown) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await logoutUser();
            setUser(null);
        } catch (err: unknown) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        loading,
        error,
        fetchMe,
        login,
        logout,
    };
}
