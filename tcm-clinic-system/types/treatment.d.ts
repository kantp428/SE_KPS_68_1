import { Pagination } from "./pagiantion";

export interface TreatmentList {
  data: Treatment[];
  pagination: Pagination;
}

export interface Treatment {
  id: number;
  healthProfileId: number;
  patientName: string;
  doctorName: string;
  serviceName: string;
  serviceTime: number;
  roomName: string;
  date?: string;
  startAt: string;
  endAt: string; //ถ้า status !== COMPLETE ส่งคาดเดา start + service time
  status: string;
}

export interface TreatmentFormValues {
  healthProfileId: number;
  doctorId: number;
  patientId: number;
  serviceId: number;
  roomId: number;
}
