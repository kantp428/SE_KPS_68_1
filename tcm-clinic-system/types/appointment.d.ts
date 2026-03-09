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
