// frontend/src/types/hotel.ts

export interface Room {
  id: number;
  type: string;
  price: number;
  is_available: boolean;
  image: string;
  amenities: string[];
  capacity: number;
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Booking {
  id: number;
  user_id?: number;
  user_name: string;
  user_email: string;
  room_id: number;
  room_type: string;
  room_price: number;
  room_image: string;
  start_date: string;
  end_date: string;
}

export interface CategoryGroup {
  category: string;
  title: string;
  tagline: string;
  basePrice: number;
  capacity: number;
  image: string;
  amenities: string[];
  description: string;
  rooms: Room[];
}

export interface PendingBookingContext {
  room: Room;
  startDate: string;
  endDate: string;
  durationDays: number;
}
