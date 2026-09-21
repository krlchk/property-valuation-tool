import { Router } from "express";
import {
  reviewPropertyPhotoController,
  reviewPropertyPhotosController,
  storePropertyReviewController,
  getPropertyReviewController,
  getPropertyRepairReviewsController,
  getPropertyReviewsController,
  getReviewsController,
  getAIReviewController,
  deleteAIReviewController,
} from "./ai-review.controller";
import { applyPagination } from "../../middlewares/pagination";

export const aiReviewRouter = Router();

aiReviewRouter.post("/photo/:photoId", reviewPropertyPhotoController);
aiReviewRouter.post("/property/:propertyId", reviewPropertyPhotosController);
aiReviewRouter.post(
  "/property/:propertyId/store",
  storePropertyReviewController,
);
aiReviewRouter.get("/", applyPagination(), getReviewsController);
aiReviewRouter.get("/:id", getAIReviewController);
aiReviewRouter.delete("/:id", deleteAIReviewController);
aiReviewRouter.get("/property/:propertyId", getPropertyReviewsController);
aiReviewRouter.get("/property/:propertyId/review", getPropertyReviewController);
aiReviewRouter.get(
  "/:aiPropertyReviewId/repairs",
  getPropertyRepairReviewsController,
);
