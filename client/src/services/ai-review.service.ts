import type { PropertyAIReview, StorePropertyAIReviewInput } from "@pvt/shared";
import { request } from "./api";

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

  storePropertyReview: (
    propertyId: string,
    input: StorePropertyAIReviewInput,
  ): Promise<void> => {
    return request<void>(
      `/ai-reviews/property/${encodeURIComponent(propertyId)}/store`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
    );
  },
};
