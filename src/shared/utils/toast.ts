import { toast, type ToastOptions } from 'react-toastify';

// Success toasts
export const showSuccess = (message: string) => {
  toast.success(message);
};

// Error toasts
export const showError = (message: string) => {
  toast.error(message);
};

// Info toasts
export const showInfo = (message: string) => {
  toast.info(message);
};

// Warning toasts
export const showWarning = (message: string) => {
  toast.warning(message);
};

// Custom toast with options
export const showCustomToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
) => {
  toast[type](message);
};

// Toast with custom configuration
export const showToastWithConfig = (
  message: string,
  options: ToastOptions = {},
) => {
  toast(message, options);
};
