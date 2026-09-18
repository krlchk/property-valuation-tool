import type { Request, Response } from "express";
import {
  reviewPropertyPhoto,
  storePropertyReview,
  getPropertyReview,
  getPropertyRepairReviews,
  requestPropertyReview,
} from "./ai-review.service";
import { PropertyReviewResult } from "@pvt/shared";

const parsePositiveInteger = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const reviewPropertyPhotoController = async (
  req: Request,
  res: Response,
) => {
  const photoId = parsePositiveInteger(req.params.photoId);
  if (!photoId)
    return res.status(400).json({ error: "Valid photo ID is required" });

  try {
    return res.status(200).json(await reviewPropertyPhoto(photoId));
  } catch (error) {
    console.error("Failed to review property photo:", error);
    return res.status(500).json({ error: "Failed to review property photo" });
  }
};

export const reviewPropertyPhotosController = async (
  req: Request,
  res: Response,
) => {
  const rawPropertyId = req.params.propertyId;
  const propertyId = Array.isArray(rawPropertyId)
    ? rawPropertyId[0]
    : rawPropertyId;

  if (!propertyId)
    return res.status(400).json({ error: "Property ID is required" });

  try {
    return res.status(200).json(await requestPropertyReview(propertyId));
  } catch (error) {
    console.error("Failed to review property photos:", error);
    return res.status(500).json({ error: "Failed to review property photos" });
  }
};

export const getPropertyReviewController = async (
  req: Request,
  res: Response,
) => {
  const rawPropertyId = req.params.propertyId;
  const propertyId = Array.isArray(rawPropertyId)
    ? rawPropertyId[0]
    : rawPropertyId;

  if (!propertyId)
    return res.status(400).json({ error: "Property ID is required" });

  try {
    return res.status(200).json(await getPropertyReview(propertyId));
  } catch (error) {
    console.error("Failed to fetch property AI reviews:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch property AI reviews" });
  }
};

export const getPropertyRepairReviewsController = async (
  req: Request,
  res: Response,
) => {
  const rawReviewId = req.params.aiPropertyReviewId;
  const reviewId = parsePositiveInteger(rawReviewId);

  if (!reviewId)
    return res
      .status(400)
      .json({ error: "Valid AI property review ID is required" });

  try {
    return res.status(200).json(await getPropertyRepairReviews(reviewId));
  } catch (error) {
    console.error("Failed to fetch property repair reviews:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch property repair reviews" });
  }
};

export const storePropertyReviewController = async (
  req: Request,
  res: Response,
) => {
  const rawPropertyId = req.params.propertyId;
  const propertyId = Array.isArray(rawPropertyId)
    ? rawPropertyId[0]
    : rawPropertyId;
  const { conditionAdjustmentPct, reviewResult, reviewResponse } = req.body;

  if (!propertyId)
    return res.status(400).json({ error: "Property ID is required" });

  if (reviewResult !== "failed" && reviewResult !== "success") {
    throw new Error("Invalid review result");
  }

  if (
    typeof conditionAdjustmentPct !== "number" ||
    !Number.isFinite(conditionAdjustmentPct)
  ) {
    return res
      .status(400)
      .json({ error: "Review pricing values must be finite numbers" });
  }
  if (!reviewResponse || typeof reviewResponse !== "object") {
    return res.status(400).json({ error: "Review response is required" });
  }

  try {
    const storeResult = await storePropertyReview({
      propertyId,
      conditionAdjustmentPct,
      result: reviewResult as PropertyReviewResult,
      reviewResponse,
    });
    return res.status(201).json(storeResult);
  } catch (error) {
    console.error("Failed to store property AI review:", error);
    return res
      .status(500)
      .json({ error: "Failed to store property AI review" });
  }
};
