
// logger.ts - Central logger utility for error logging/monitoring
// In the future, hook this with a monitoring service (e.g., Sentry, LogRocket).

export const logError = (err: unknown, context?: string) => {
  // Enhance with stack trace, error IDs, or send to monitoring backend.
  const msg = context ? `[${context}]` : "[Error]";
  if (err instanceof Error) {
    console.error(`${msg} ${err.message}`, err.stack);
  } else {
    console.error(`${msg} Unknown error:`, err);
  }
};
