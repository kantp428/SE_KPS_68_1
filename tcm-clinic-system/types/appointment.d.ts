export interface AppointmentSlot {
    time: string; // e.g. "09:00"
    isAvailable: boolean;
    reason?: string; // เหตุผลที่จองไม่ได้ (ห้องเต็ม, ไม่มีหมอเข้างาน)
}

export interface GetSlotsResponse {
    date: string; // yyyy-mm-dd
    slots: AppointmentSlot[];
}

export interface BookAppointmentPayload {
    date: string; // yyyy-mm-dd
    time: string; // "09:00"
}

export interface AppointmentData {
    id: number;
    patientId: number;
    datetime: string;
    status: string;
}

export type AppointmentStatusUpdate = "CANCELLED" | "COMPLETED";

export interface AppointmentStatusUpdateResponse {
    message: string;
    appointment: AppointmentData;
}

export interface MedAssistAppointmentListItem {
    id: number;
    patientId: number;
    patientName: string;
    patientPhone: string;
    datetime: string;
    date: string; // for display yyyy-MM-dd
    time: string; // for display HH:mm
    status: string;
}

export interface MedAssistAppointmentListResponse {
    data: MedAssistAppointmentListItem[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
