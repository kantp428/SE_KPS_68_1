import type { patient, staff } from "@prisma/client";

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    role: string;
    staffRole?: string;
    fullName: string;
    patient?: patient;
    staff?: staff;
}

export interface LoginFormValues {
    username?: string;
    email?: string;
    password?: string;
    isAdminLogin?: boolean;
}

export interface RegisterFormValues {
    email: string;
    password: string;
    confirmPassword?: string;
    firstName: string;
    lastName: string;
    thaiId: string;
    birthdate: string;
    gender: "MALE" | "FEMALE";
    phoneNumber: string;
    bloodGroup: "A" | "B" | "AB" | "O";
    chronicDisease?: string;
}
