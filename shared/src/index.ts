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

  userId?: string | null;

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

  userId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface EstimatePropertyRequest {
  propId: string;
  conditionAdjustmentPct: number;
}

export interface EstimateResponse {
  finalEstimatedPrice: number;
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

export type PropertyComponentCategory =
  | "roof"
  | "exterior_paint"
  | "windows"
  | "kitchen"
  | "bathrooms"
  | "floors"
  | "doors"
  | "landscaping"
  | "garage"
  | "laundry_room"
  | "deck";

export type ComponentGradeType = "GOOD" | "FAIR" | "BAD";

export type ComponentEvaluationGrade = ComponentGradeType | "UNKNOWN" | "N/A";

export interface AIComponentEvaluation {
  component: PropertyComponentCategory;
  grade: ComponentEvaluationGrade;
  confidence: number;
  reason: string;
  recommendedAction: string | null;
  flaggedPhotoIds: string[] | null;
  photoIds: string[];
  repairEstimate?: RepairEstimate | null;
}

export interface EvaluatedComponentResult extends AIComponentEvaluation {
  gradePercentage: number;
}

export interface PropertyComponentGrade {
  id: number;
  componentKey: PropertyComponentCategory;
  grade: ComponentGradeType;
  gradePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateComponentGradeInput {
  gradePercentage: number;
}

export interface PropertyPhoto {
  id: number;
  propertyId: string;
  url?: string;
  category: PropertyComponentCategory;
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

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  mobileNumber: string;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export type OfferStatus = "accepted" | "proccessed" | "done";

export interface Offer {
  id: string;
  propertyId: string;
  userId: string;
  minPrice: number;
  maxPrice: number;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OfferStatusHistory {
  id: number;
  offerId: string;
  status: OfferStatus;
  createdAt: string;
}

export interface CreateOfferPayload {
  propertyId: string;
  userId: string;
  minPrice: number;
  maxPrice: number;
  status?: OfferStatus;
}

export interface UpdateOfferPayload {
  minPrice?: number;
  maxPrice?: number;
  status?: OfferStatus;
}

export interface FetchAllResponse<T> {
  data: T[];
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type PropertyAIReview = {
  propertyId: string;
  evaluations: EvaluatedComponentResult[];
  totalAdjustmentPct: number;
};

export type StorePropertyAIReviewInput = {
  conditionAdjustmentPct: number;
  reviewResponse: PropertyAIReview;
};

export interface PropertyReview {
  id: number;
  propertyId: string;
  result: PropertyReviewResult;
  conditionAdjustmentPct: number;
  reviewResponse: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type AiReview = Omit<AIComponentEvaluation, "component" | "photoIds">;

export type PropertyPhotoReview = {
  propertyId: string;
  evaluations: EvaluatedComponentResult[];
  totalAdjustmentPct: number;
};

export type PropertyReviewResult = "success" | "failed";

export type StorePropertyReviewInput = {
  propertyId: string;
  result: PropertyReviewResult;
  conditionAdjustmentPct: number;
  reviewResponse: PropertyPhotoReview;
};

export type StoreComponentRepairEstimateInput = {
  propertyId: string;
  aiPropertyReviewId: number;
  componentKey: PropertyComponentCategory;
  grade: ComponentGradeType;
  repairPrice: number | null;
  reviewResponse: RepairEstimate;
};

export interface RepairEstimate {
  title: string;
  note: string;
  noteTone: "warning" | null;
  amount?: number; // Calculated via grade percentage lookup from starting property value
}

export type ReviewProcessResult =
  | {
      status: "SUCCESS";
      propertyId: string;
      reviewId: number;
      totalAdjustmentPct: number;
      evaluations: EvaluatedComponentResult[];
    }
  | {
      status: "FAILED";
      propertyId: string;
      reason: string;
      unresolvedComponents: Array<{
        component: PropertyComponentCategory;
        reason: string;
        recommendedAction?: string | null;
      }>;
    };

export interface PropertyRepairReview {
  id: number;

  propertyId: string;
  aiPropertyReviewId: number;

  componentKey: PropertyComponentCategory;
  grade: ComponentGradeType;

  estimatedRepairPrice: number;

  reviewResponse: RepairEstimate;

  createdAt: string;
  updatedAt: string;
}
