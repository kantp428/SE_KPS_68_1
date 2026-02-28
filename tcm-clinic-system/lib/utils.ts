import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleException(e: unknown, output: string): string {
  if (axios.isAxiosError(e)) {
    const serverMessage =
      e.response?.data?.message ||
      e.response?.data?.error ||
      e.response?.data?.msg ||
      e.message;

    return `${output}: ${serverMessage}`;
  }

  if (e instanceof Error) {
    return `${output}: ${e.message}`;
  }

  return `${output}: Unknown error`;
}
