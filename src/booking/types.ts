// Booking flow TypeScript types

export interface BookingService {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // GTQ
  category: string;
}

export interface CustomerDraft {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BookingState {
  selectedServices: BookingService[];
  selectedDate: string | null; // "YYYY-MM-DD"
  selectedTimeSlot: string | null; // "HH:mm"
  customer: CustomerDraft;
  isConfirmed: boolean;
}

export type BookingAction =
  | { type: 'ADD_SERVICE'; payload: BookingService }
  | { type: 'REMOVE_SERVICE'; payload: string } // service id
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_TIME_SLOT'; payload: string }
  | { type: 'UPDATE_CUSTOMER'; payload: Partial<CustomerDraft> }
  | { type: 'CONFIRM' }
  | { type: 'RESET' };
