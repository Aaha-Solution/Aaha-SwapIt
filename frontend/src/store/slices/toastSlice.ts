import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick?: () => void;
  url?: string;
}

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // duration in ms, default 4000ms
  action?: ToastAction;
  createdAt: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (
      state,
      action: PayloadAction<{
        type?: ToastType;
        title?: string;
        message: string;
        duration?: number;
        action?: ToastAction;
      }>
    ) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const newToast: Toast = {
        id,
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration ?? 4000,
        action: action.payload.action,
        createdAt: Date.now(),
      };
      // Keep up to 5 concurrent toasts max
      state.toasts = [newToast, ...state.toasts.slice(0, 4)];
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearAllToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearAllToasts } = toastSlice.actions;
export default toastSlice.reducer;
