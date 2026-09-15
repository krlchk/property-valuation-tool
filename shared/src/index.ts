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
  startingValue: number;

  latitude?: number;
  longitude?: number;
  addressProvider?: string;
  providerPlaceId?: string;
  offerTermsId?: number;
}

export interface UpdatePropertyRequest {
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;

  latitude?: number | null;
  longitude?: number | null;
  addressProvider?: string | null;
  providerPlaceId?: string | null;

  squareFeet?: number | null;

  startingValue?: number | null;
  
  offerTermsId?: number | null;

  // status?: PropertyStatus | string;
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

  startingValue: number;

  offerTermsId: number | null;
  status: string;

  createdAt: string;
  updatedAt: string;
}

export interface EstimatePropertyRequest {
  prorpId: string;
}

// Offer Terms
export interface OfferTerm {
  id: number;
  key: string;
  priceMultiplier: number;
  closingDaysMin: number;
  closingDaysMax: number | null;
  inspectionDays: number;
  inspectionDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PropertyPhotoCategory =
  | "Roof"
  | "Exterior paint"
  | "Windows"
  | "Kitchen"
  | "Bathrooms"
  | "Floors"
  | "Doors"
  | "Landscaping"
  | "Garage"
  | "Laundry room"
  | "Deck";

export interface PropertyPhoto {
  id: number;
  propertyId: string;
  url?: string;
  category: PropertyPhotoCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferTermsRequest {
  priceMultiplier: number;
  closingDaysMin: number;
  closingDaysMax?: number | null;
  inspectionDays: number;
  inspectionDescription?: string | null;
}

export interface UpdateOfferTermsRequest {
  priceMultiplier?: number;
  closingDaysMin?: number;
  closingDaysMax?: number | null;
  inspectionDays?: number;
  inspectionDescription?: string | null;
}
