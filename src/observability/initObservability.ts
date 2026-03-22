/**
 * Optional client error reporting. Set VITE_SENTRY_DSN in production to enable.
 */
export async function initObservability(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn?.trim()) return;

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn: dsn.trim(),
      environment: import.meta.env.MODE,
      sendDefaultPii: false,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
    });
  } catch (e) {
    console.warn('Sentry failed to load:', e);
  }
}
