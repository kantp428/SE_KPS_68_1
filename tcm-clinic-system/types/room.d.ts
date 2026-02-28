import { Pagination } from "./pagiantion";

export interface RoomList {
  data: Room[];
  pagination: Pagination;
}

export interface Room {
  id: number;
  name: string;
  status: string;
}

export interface RoomFormValues {
  name: string;
  status: string;
}
