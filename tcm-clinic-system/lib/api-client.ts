import axios from "axios";

const baseURL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api")
    : "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
