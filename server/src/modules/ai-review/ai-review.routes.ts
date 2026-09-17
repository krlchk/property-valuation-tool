import { Router } from "express";
import {
  reviewPropertyPhotoController,
  reviewPropertyPhotosController,
  storePropertyReviewController,
  getPropertyReviewsController,
} from "./ai-review.controller";

export const aiReviewRouter = Router();

aiReviewRouter.post("/photo/:photoId", reviewPropertyPhotoController);
aiReviewRouter.post("/property/:propertyId", reviewPropertyPhotosController);
aiReviewRouter.post("/property/:propertyId/store", storePropertyReviewController);
aiReviewRouter.get("/property/:propertyId", getPropertyReviewsController);
