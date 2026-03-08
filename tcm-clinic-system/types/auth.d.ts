export interface AuthUser {
    id: number;
    username: string;
    email: string;
    role: string;
    fullName: string;
}

export interface LoginFormValues {
    username?: string;
    email?: string;
    password?: string;
}

export interface RegisterFormValues {
    username: string;
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
