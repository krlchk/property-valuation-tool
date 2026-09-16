import type { EvaluatedComponentResult } from "@pvt/shared";
import { request } from "./api";

export type PropertyAIReview = {
  propertyId: string;
  evaluations: EvaluatedComponentResult[];
  totalAdjustmentPct: number;
};

const inFlightReviews = new Map<string, Promise<PropertyAIReview>>();

export const aiReviewService = {
  reviewPropertyById: (propertyId: string): Promise<PropertyAIReview> => {
    const existingRequest = inFlightReviews.get(propertyId);
    if (existingRequest) return existingRequest;

    const reviewRequest = request<PropertyAIReview>(
      `/ai-reviews/property/${encodeURIComponent(propertyId)}`,
      { method: "POST" },
    );
    inFlightReviews.set(propertyId, reviewRequest);

    const clearRequest = () => {
      if (inFlightReviews.get(propertyId) === reviewRequest) {
        inFlightReviews.delete(propertyId);
      }
    };
    reviewRequest.then(clearRequest, clearRequest);

    return reviewRequest;
  },
};
