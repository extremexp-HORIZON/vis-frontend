import { toast } from 'react-toastify';

// Success toasts
export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showZoneCreated = () => {
  toast.success('Zone created successfully!');
};

export const showZoneUpdated = () => {
  toast.success('Zone updated successfully!');
};

export const showZoneDeleted = () => {
  toast.success('Zone deleted successfully!');
};

export const showZonesLoaded = (count: number) => {
  if (count > 0) {
    toast.success(`Successfully loaded ${count} zones`);
  } else {
    toast.info('No zones found for this dataset');
  }
};

// Error toasts
export const showError = (message: string) => {
  toast.error(message);
};

export const showZoneError = (operation: string, error: string) => {
  toast.error(`Failed to ${operation} zone: ${error}`);
};

// Info toasts
export const showInfo = (message: string) => {
  toast.info(message);
};

export const showLoading = (message: string) => {
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
export const showToastWithConfig = (message: string, options: any = {}) => {
  toast(message, options);
};
