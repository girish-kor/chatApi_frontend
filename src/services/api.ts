import { BASE_URL } from '../constants';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = { ...options.headers };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // Retry transient network failures a few times with exponential backoff.
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if ((import.meta as any).env?.DEV) {
        console.debug('[apiFetch] request', { url, options, headers, attempt });
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
      if (!text) return {};

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
      // JSON parse errors
      if (err instanceof SyntaxError) {
        throw new Error(
          `Unexpected response from server. It might be a proxy error page. ${err.message}`
        );
      }

      // Network failures (fetch throws TypeError with message 'Failed to fetch')
      const isNetworkErr =
        err instanceof TypeError && String(err.message).includes('Failed to fetch');
      if (isNetworkErr) {
        if (attempt < maxAttempts) {
          // backoff before retry
          const delay = Math.min(300 * 2 ** (attempt - 1), 2000);
          await new Promise((r) => setTimeout(r, delay));
          continue; // retry
        }
        // final failure -> throw clearer message
        throw new Error(
          `Network Error: Could not connect to the server. This may be a CORS issue, a dev-proxy misconfiguration, or the server might be offline. Check your network and server, then try again.`
        );
      }

      // Other errors (HTTP errors etc.) — rethrow
      throw err;
    }
  }
  // Shouldn't reach here, but satisfy TypeScript
  throw new Error('Unreachable: apiFetch exhausted retries');
}
