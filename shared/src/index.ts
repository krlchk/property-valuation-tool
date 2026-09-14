export interface HealthResponse {
  status: "ok";
  message: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface AddressSuggestion {
  id: string;
  label: string;
}

export interface NormalizedAddress {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  provider: "google";
  providerPlaceId: string;
}

export interface CreatePropertyRequest {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;

  latitude?: number;
  longitude?: number;
  addressProvider?: string;
  providerPlaceId?: string;
}

export interface PropertyResponse {
  id: string;

  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;

  latitude: number | null;
  longitude: number | null;
  addressProvider: string | null;
  providerPlaceId: string | null;

  squareFeet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;

  startingValue: number | null;
  startingValueSource: string | null;

  timeline: string | null;
  status: string;

  createdAt: string;
  updatedAt: string;
}
