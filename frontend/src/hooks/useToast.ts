import { useDispatch } from 'react-redux';
import { addToast, removeToast, clearAllToasts, ToastType, ToastAction } from '../store/slices/toastSlice';
import { useCallback } from 'react';

export const useToast = () => {
  const dispatch = useDispatch();

  const show = useCallback(
    (
      message: string,
      options?: {
        type?: ToastType;
        title?: string;
        duration?: number;
        action?: ToastAction;
      }
    ) => {
      dispatch(
        addToast({
          message,
          type: options?.type || 'info',
          title: options?.title,
          duration: options?.duration,
          action: options?.action,
        })
      );
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string, options?: { title?: string; duration?: number; action?: ToastAction }) => {
      show(message, { ...options, type: 'success' });
    },
    [show]
  );

  const error = useCallback(
    (message: string, options?: { title?: string; duration?: number; action?: ToastAction }) => {
      show(message, { ...options, type: 'error' });
    },
    [show]
  );

  const warning = useCallback(
    (message: string, options?: { title?: string; duration?: number; action?: ToastAction }) => {
      show(message, { ...options, type: 'warning' });
    },
    [show]
  );

  const info = useCallback(
    (message: string, options?: { title?: string; duration?: number; action?: ToastAction }) => {
      show(message, { ...options, type: 'info' });
    },
    [show]
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch]
  );

  const clearAll = useCallback(() => {
    dispatch(clearAllToasts());
  }, [dispatch]);

  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss,
    clearAll,
  };
};
