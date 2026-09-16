import { Router } from "express";
import {
  reviewPropertyPhotoController,
  reviewPropertyPhotosController,
} from "./ai-review.controller";

export const aiReviewRouter = Router();

aiReviewRouter.post("/photo/:photoId", reviewPropertyPhotoController);
aiReviewRouter.post("/property/:propertyId", reviewPropertyPhotosController);
