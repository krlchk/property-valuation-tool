import type { HealthResponse } from "@pvt/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? `Request to ${path} failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const healthService = {
  getHealth: (): Promise<HealthResponse> => {
    return request<HealthResponse>("/health");
  },
};
