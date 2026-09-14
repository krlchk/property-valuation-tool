export interface HealthResponse {
  status: "ok";
  message: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

export interface CreatePropertyRequest {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface PropertyResponse {
  id: string;

  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;

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
