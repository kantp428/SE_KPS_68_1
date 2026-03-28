"use client";

import { handleException } from "@/app/utils/handleException";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { AuthUser, LoginFormValues } from "@/types/auth";
import axios from "axios";
import { useCallback, useState } from "react";

/* ===============================
   Axios instance
================================ */
const api = apiClient;

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
    const { refreshUser } = useAuth() || {};
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Keep fetchMe for backward compatibility if needed, but it should Ideally use context
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
            if (refreshUser) {
                await refreshUser();
            }
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
            if (refreshUser) {
                await refreshUser();
            }
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
