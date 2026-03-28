import { Pagination } from "./pagiantion";

export interface ServiceList {
  data: Service[];
  pagination: Pagination;
}

export interface Service {
  id: number;
  name: string;
  price: string;
  duration_minute: number;
  status: string;
}

export interface ServiceFormValues {
  name: string;
  price: number;
  duration_minute: number;
  status: string;
}