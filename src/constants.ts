// Use relative path in development so Vite dev server proxy can forward requests to the remote API.
// In production, use the absolute API URL.
export const BASE_URL = (import.meta as any).env?.DEV ? '' : 'https://chatapi.miniproject.in';
