import type { Request, Response } from "express";
import {
  createOffer,
  deleteOffer,
  findAllOffers,
  findOfferById,
  getOfferHistory,
  updateOffer,
} from "./offers.service";
import { OfferStatus } from "@pvt/shared";
import { getIdFromParam } from "../../utils/query";

const VALID_STATUSES: OfferStatus[] = ["accepted", "proccessed", "done"];

const isOfferStatus = (val: unknown): val is OfferStatus =>
  typeof val === "string" && VALID_STATUSES.includes(val as OfferStatus);

export const getAllOffersController = async (_req: Request, res: Response) => {
  try {
    const offers = await findAllOffers();
    return res.status(200).json(offers);
  } catch (error: any) {
    console.error("Failed to fetch offers:", error);
    return res.status(500).json({ error: error?.message || "Failed to fetch offers" });
  }
};

export const getOfferByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);

    const offer = await findOfferById(id);
    return offer
      ? res.status(200).json(offer)
      : res.status(404).json({ error: "Offer not found" });
  } catch (error: any) {
    console.error("Failed to fetch offer:", error);
    return res.status(500).json({ error: error?.message || "Failed to fetch offer" });
  }
};

export const createOfferController = async (req: Request, res: Response) => {
  try {
    const { propertyId, userId, minPrice, maxPrice, status } = req.body;

    if (!propertyId || typeof propertyId !== "string") {
      return res.status(400).json({ error: "propertyId is required and must be a string" });
    }

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required and must be a string" });
    }

    if (typeof minPrice !== "number" || typeof maxPrice !== "number") {
      return res.status(400).json({ error: "minPrice and maxPrice are required numbers" });
    }

    if (minPrice > maxPrice) {
      return res.status(400).json({ error: "minPrice cannot be greater than maxPrice" });
    }

    if (status !== undefined && !isOfferStatus(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const newOffer = await createOffer({ propertyId, userId, minPrice, maxPrice, status });
    return res.status(201).json(newOffer);
  } catch (error: any) {
    console.error("Failed to create offer:", error);
    return res.status(500).json({ error: error?.message || "Failed to create offer" });
  }
};

export const updateOfferController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);
    const { minPrice, maxPrice, status } = req.body;

    if (status !== undefined && !isOfferStatus(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({ error: "minPrice cannot be greater than maxPrice" });
    }

    const updated = await updateOffer(id, { minPrice, maxPrice, status });
    return updated
      ? res.status(200).json(updated)
      : res.status(404).json({ error: "Offer not found" });
  } catch (error: any) {
    console.error("Failed to update offer:", error);
    return res.status(500).json({ error: error?.message || "Failed to update offer" });
  }
};

export const deleteOfferController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);

    const deleted = await deleteOffer(id);
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: "Offer not found" });
  } catch (error: any) {
    console.error("Failed to delete offer:", error);
    return res.status(500).json({ error: error?.message || "Failed to delete offer" });
  }
};

export const getOfferHistoryController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);

    const history = await getOfferHistory(id);
    return res.status(200).json(history);
  } catch (error: any) {
    console.error("Failed to fetch offer history:", error);
    return res.status(500).json({ error: error?.message || "Failed to fetch offer history" });
  }
};