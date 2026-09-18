import { Router } from "express";
import {
  reviewPropertyPhotoController,
  reviewPropertyPhotosController,
  storePropertyReviewController,
  getPropertyReviewController,
  getPropertyRepairReviewsController,
} from "./ai-review.controller";

export const aiReviewRouter = Router();

aiReviewRouter.post("/photo/:photoId", reviewPropertyPhotoController);
aiReviewRouter.post("/property/:propertyId", reviewPropertyPhotosController);
aiReviewRouter.post(
  "/property/:propertyId/store",
  storePropertyReviewController,
);
aiReviewRouter.get("/property/:propertyId", getPropertyReviewController);
aiReviewRouter.get(
  "/:aiPropertyReviewId/repairs",
  getPropertyRepairReviewsController,
);
