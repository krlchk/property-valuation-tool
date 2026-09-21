import type {
  PropertyRepairReview,
  PropertyReview,
  ReviewProcessResult,
} from "@pvt/shared";
import { request } from "./api";

const inFlightReviews = new Map<string, Promise<ReviewProcessResult>>();

export const aiReviewService = {
  getPropertyReview: (propertyId: string): Promise<PropertyReview | null> =>
    request<PropertyReview | null>(
      `/ai-reviews/property/${encodeURIComponent(propertyId)}/review`,
    ),

  reviewPropertyById: (propertyId: string): Promise<ReviewProcessResult> => {
    const existingRequest = inFlightReviews.get(propertyId);
    if (existingRequest) return existingRequest;

    const reviewRequest = request<ReviewProcessResult>(
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

  getPropertyRepairReviews: (
    aiPropertyReviewId: number,
  ): Promise<PropertyRepairReview[]> =>
    request<PropertyRepairReview[]>(
      `/ai-reviews/${encodeURIComponent(String(aiPropertyReviewId))}/repairs`,
    ),
};
