export interface RoomList {
  data: Room[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
