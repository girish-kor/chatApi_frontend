import { BASE_URL } from '../constants';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = { ...options.headers };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    if ((import.meta as any).env?.DEV) {
      console.debug('[apiFetch] request', { url, options, headers });
    }

    const res = await fetch(url, { ...options, headers });

    const text = await res.text();

    if (!res.ok) {
      // Include response body and URL in the error for easier debugging
      const bodyPreview = text?.slice(0, 200);
      const msg = `Server returned an error: ${res.status} ${res.statusText}. URL: ${url} Response: ${bodyPreview}`;
      const error = new Error(msg);
      (error as any).status = res.status;
      (error as any).body = text;
      throw error;
    }

    // Handle cases where the response body is empty (e.g., a 204 No Content)
    if (!text) {
      return {};
    }
    // Handle cases where the response body is empty (e.g., a 204 No Content)
    if (!text) {
      return {};
    }

    // Check if the response is JSON before parsing
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return JSON.parse(text);
    }

    // If it's not JSON, it could be an error from the proxy — include the body in the error.
    const msg = `Received non-JSON response from server or proxy. URL: ${url} Response: ${text.slice(
      0,
      200
    )}`;
    throw new Error(msg);
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      // This catches JSON.parse errors
      throw new Error(
        `Unexpected response from server. It might be a proxy error page. ${err.message}`
      );
    }
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new Error(
        `Network Error: Could not connect to the server. This may be a CORS issue or the server might be offline. Please check your network connection and try again.`
      );
    }
    throw err;
  }
}
