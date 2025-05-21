const isDev =
  import.meta.env?.MODE === 'development' || process.env.NODE_ENV === 'development';

type LogArgs = unknown[]; // Avoids `any` while allowing flexible input

export const logger = {
  log: (...args: LogArgs): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  warn: (...args: LogArgs): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: LogArgs): void => {
    // eslint-disable-next-line no-console
    console.error(...args);
  },
};
