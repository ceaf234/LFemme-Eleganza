import { createContext, useContext, useReducer, useMemo } from 'react';
import type { BookingState, BookingAction } from './types';
import { bookingReducer, createInitialState } from './bookingReducer';

interface BookingContextValue {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  totalPrice: number;
  totalDuration: number;
  canProceedToSchedule: boolean;
  canProceedToConfirm: boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, undefined, createInitialState);

  const value = useMemo<BookingContextValue>(() => {
    const totalPrice = state.selectedServices.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = state.selectedServices.reduce((sum, s) => sum + s.duration, 0);

    return {
      state,
      dispatch,
      totalPrice,
      totalDuration,
      canProceedToSchedule: state.selectedServices.length > 0,
      canProceedToConfirm: state.selectedStaffId !== null && state.selectedDate !== null && state.selectedTimeSlot !== null,
    };
  }, [state, dispatch]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
