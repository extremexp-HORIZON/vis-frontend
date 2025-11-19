/**
 * Utility functions for date and time operations
 */

import { logger } from './logger';

/**
 * Parses a timestamp in YYYYMMDD_HHMMSS format to a Date object
 * The timestamp is assumed to be in UTC timezone
 * @param timestamp - Timestamp string in format "20251014_134745" (UTC)
 * @returns Date object or null if parsing fails
 */
export const parseTimestamp = (timestamp: string): Date | null => {
  try {
    // Parse timestamp format: YYYYMMDD_HHMMSS
    const [datePart, timePart] = timestamp.split('_');

    if (
      !datePart ||
      !timePart ||
      datePart.length !== 8 ||
      timePart.length !== 6
    ) {
      return null;
    }

    const year = parseInt(datePart.substring(0, 4), 10);
    const month = parseInt(datePart.substring(4, 6), 10) - 1; // Month is 0-indexed
    const day = parseInt(datePart.substring(6, 8), 10);
    const hours = parseInt(timePart.substring(0, 2), 10);
    const minutes = parseInt(timePart.substring(2, 4), 10);
    const seconds = parseInt(timePart.substring(4, 6), 10);

    // Create date in UTC timezone since the backend sends UTC timestamps
    const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch (error) {
    logger.warn('Failed to parse timestamp:', timestamp, error);

    return null;
  }
};

/**
 * Formats a timestamp string to a readable date string
 * @param timestamp - Timestamp string in format "20251014_134745"
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string or original timestamp if parsing fails
 */
export const formatTimestamp = (
  timestamp: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string => {
  const date = parseTimestamp(timestamp);

  if (!date) {
    return timestamp; // Return original if parsing fails
  }

  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a timestamp to a short date string (e.g., "Oct 14, 2025")
 * @param timestamp - Timestamp string in format "20251014_134745"
 * @returns Short formatted date string
 */
export const formatTimestampShort = (timestamp: string): string => {
  return formatTimestamp(timestamp, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a timestamp to a full date and time string (e.g., "Oct 14, 2025, 01:47 PM")
 * @param timestamp - Timestamp string in format "20251014_134745"
 * @returns Full formatted date and time string
 */
export const formatTimestampFull = (timestamp: string): string => {
  return formatTimestamp(timestamp, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
