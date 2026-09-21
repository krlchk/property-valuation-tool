import { PropertyReview } from "@pvt/shared";

export const downloadReview = (review: PropertyReview) => {
  if (!review.reviewResponse) return;

  const jsonString = JSON.stringify(review.reviewResponse, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `property-${review.propertyId}-review-${review.id}-response.json`;
  link.click();
  URL.revokeObjectURL(url);
};
