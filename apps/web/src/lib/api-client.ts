/**
 * Server components (RSC) run inside the Docker network → use API_URL (http://api:3001).
 * Client components run in the browser → use NEXT_PUBLIC_API_URL (http://localhost:3001).
 */
function getBaseUrl() {
  if (typeof window === 'undefined') {
    // Server-side: use the private Docker-internal URL set at runtime
    return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  }
  // Client-side (browser): use the public URL baked in at build time
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.error ?? `HTTP ${res.status}`), { status: res.status });
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, token?: string) => request<T>(path, { token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), token }),
  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),
  delete: <T>(path: string, token?: string) => request<T>(path, { method: 'DELETE', token }),
};
