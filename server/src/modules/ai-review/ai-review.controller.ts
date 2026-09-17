import type { Request, Response } from "express";
import {
  reviewPropertyPhoto,
  reviewPropertyPhotos,
  storePropertyReview,
  getPropertyReviews,
} from "./ai-review.service";

const parsePositiveInteger = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const reviewPropertyPhotoController = async (req: Request, res: Response) => {
  const photoId = parsePositiveInteger(req.params.photoId);
  if (!photoId) return res.status(400).json({ error: "Valid photo ID is required" });

  try {
    return res.status(200).json(await reviewPropertyPhoto(photoId));
  } catch (error) {
    console.error("Failed to review property photo:", error);
    return res.status(500).json({ error: "Failed to review property photo" });
  }
};

export const reviewPropertyPhotosController = async (req: Request, res: Response) => {
  const rawPropertyId = req.params.propertyId;
  const propertyId = Array.isArray(rawPropertyId)
    ? rawPropertyId[0]
    : rawPropertyId;

  if (!propertyId) return res.status(400).json({ error: "Property ID is required" });

  try {
    return res.status(200).json(await reviewPropertyPhotos(propertyId));
  } catch (error) {
    console.error("Failed to review property photos:", error);
    return res.status(500).json({ error: "Failed to review property photos" });
  }
};

export const getPropertyReviewsController = async (req: Request, res: Response) => {
  const rawPropertyId = req.params.propertyId;
  const propertyId = Array.isArray(rawPropertyId) ? rawPropertyId[0] : rawPropertyId;

  if (!propertyId) return res.status(400).json({ error: "Property ID is required" });

  try {
    return res.status(200).json(await getPropertyReviews(propertyId));
  } catch (error) {
    console.error("Failed to fetch property AI reviews:", error);
    return res.status(500).json({ error: "Failed to fetch property AI reviews" });
  }
};

export const storePropertyReviewController = async (req: Request, res: Response) => {
  const rawPropertyId = req.params.propertyId;
  const propertyId = Array.isArray(rawPropertyId) ? rawPropertyId[0] : rawPropertyId;
  const {
    estimatedPrice,
    conditionAdjustmentPct,
    offerTermPct,
    finalEstimatedPrice,
    reviewResponse,
  } = req.body;

  if (!propertyId) return res.status(400).json({ error: "Property ID is required" });

  const values = [
    estimatedPrice,
    conditionAdjustmentPct,
    offerTermPct,
    finalEstimatedPrice,
  ];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return res.status(400).json({ error: "Review pricing values must be finite numbers" });
  }
  if (!reviewResponse || typeof reviewResponse !== "object") {
    return res.status(400).json({ error: "Review response is required" });
  }

  try {
    const result = await storePropertyReview({
      propertyId,
      estimatedPrice,
      conditionAdjustmentPct,
      offerTermPct,
      finalEstimatedPrice,
      reviewResponse,
    });
    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to store property AI review:", error);
    return res.status(500).json({ error: "Failed to store property AI review" });
  }
};
