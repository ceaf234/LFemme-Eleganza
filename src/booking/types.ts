// Booking flow TypeScript types

export interface BookingService {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // GTQ
  category: string;
}

export interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
}

export interface AvailableSlot {
  slot_start: string; // "HH:MM:SS" from Supabase time type
  slot_end: string;
  is_available: boolean;
}

export interface CustomerDraft {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BookingState {
  selectedServices: BookingService[];
  selectedStaffId: number | null;
  selectedDate: string | null; // "YYYY-MM-DD"
  selectedTimeSlot: string | null; // "HH:mm"
  customer: CustomerDraft;
  customerInfoCompleted: boolean;
  paymentMethod: 'full' | 'deposit' | null;
  isConfirmed: boolean;
  confirmedAppointmentId: number | null;
}

export type BookingAction =
  | { type: 'ADD_SERVICE'; payload: BookingService }
  | { type: 'REMOVE_SERVICE'; payload: string } // service id
  | { type: 'SET_STAFF'; payload: number }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME_SLOT'; payload: string }
  | { type: 'UPDATE_CUSTOMER'; payload: Partial<CustomerDraft> }
  | { type: 'COMPLETE_CUSTOMER_INFO' }
  | { type: 'SET_PAYMENT_METHOD'; payload: 'full' | 'deposit' }
  | { type: 'CONFIRM'; payload: number } // appointment ID
  | { type: 'RESET' };
