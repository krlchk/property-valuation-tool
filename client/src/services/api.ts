import type {
  AddressSuggestion,
  CreatePropertyRequest,
  HealthResponse,
  NormalizedAddress,
  PropertyResponse,
} from "@pvt/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request to ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export function createProperty(input: CreatePropertyRequest): Promise<PropertyResponse> {
  return request<PropertyResponse>("/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function searchAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<AddressSuggestion[]> {
  return request<AddressSuggestion[]>(
    `/addresses/search?q=${encodeURIComponent(query)}`,
    { signal },
  );
}

export function getAddressDetails(placeId: string): Promise<NormalizedAddress> {
  return request<NormalizedAddress>(`/addresses/${encodeURIComponent(placeId)}`);
}
