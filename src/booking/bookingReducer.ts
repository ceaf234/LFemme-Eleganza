import type { BookingState, BookingAction, CustomerDraft } from './types';

const INITIAL_CUSTOMER: CustomerDraft = {
  name: '',
  phone: '',
  email: '',
  notes: '',
};

export function createInitialState(): BookingState {
  return {
    selectedServices: [],
    selectedStaffId: null,
    selectedDate: null,
    selectedTimeSlot: null,
    customer: { ...INITIAL_CUSTOMER },
    isConfirmed: false,
  };
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'ADD_SERVICE': {
      const alreadySelected = state.selectedServices.some(
        (service) => service.id === action.payload.id
      );
      if (alreadySelected) return state;
      return {
        ...state,
        selectedServices: [...state.selectedServices, action.payload],
      };
    }

    case 'REMOVE_SERVICE':
      return {
        ...state,
        selectedServices: state.selectedServices.filter(
          (service) => service.id !== action.payload
        ),
      };

    case 'SET_STAFF':
      return {
        ...state,
        selectedStaffId: action.payload,
        selectedDate: null,
        selectedTimeSlot: null,
      };

    case 'SET_DATE':
      return {
        ...state,
        selectedDate: action.payload,
        selectedTimeSlot: null, // Reset time when date changes
      };

    case 'SET_TIME_SLOT':
      return {
        ...state,
        selectedTimeSlot: action.payload,
      };

    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customer: { ...state.customer, ...action.payload },
      };

    case 'CONFIRM':
      return {
        ...state,
        isConfirmed: true,
      };

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
