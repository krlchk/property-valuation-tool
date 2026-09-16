import type { EvaluatedComponentResult } from "@pvt/shared";
import { request } from "./api";

export type PropertyAIReview = {
  propertyId: string;
  evaluations: EvaluatedComponentResult[];
  totalAdjustmentPct: number;
};

export const aiReviewService = {
  reviewPropertyById: (propertyId: string): Promise<PropertyAIReview> =>
    request<PropertyAIReview>(
      `/ai-reviews/property/${encodeURIComponent(propertyId)}`,
      { method: "POST" },
    ),
};
