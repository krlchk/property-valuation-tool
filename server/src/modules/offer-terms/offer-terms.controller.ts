import { Request, Response } from "express";
import {
  getAllOfferTerms,
  getOfferTermsById,
  createOfferTerms,
  updateOfferTerms,
  deleteOfferTerms,
} from "./offer-terms.service";
import { getIdFromParam } from "../../utils/query";

export const getAllOfferTermsController = async (_req: Request, res: Response) => {
  try {
    const terms = await getAllOfferTerms();
    return res.status(200).json(terms);
  } catch (error) {
    console.error("Failed to fetch offer terms:", error);
    return res.status(500).json({
      error: "Failed to fetch offer terms",
    });
  }
};

export const getOfferTermsByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req, true);

    if (!id) {
      return res.status(400).json({
        error: "Valid offer terms ID is required",
      });
    }

    const term = await getOfferTermsById(id);

    if (!term) {
      return res.status(404).json({
        error: "Offer terms not found",
      });
    }

    return res.status(200).json(term);
  } catch (error) {
    console.error("Failed to fetch offer terms:", error);
    return res.status(500).json({
      error: "Failed to fetch offer terms",
    });
  }
};

export const createOfferTermsController = async (req: Request, res: Response) => {
  try {
    const {
      priceMultiplier,
      closingDaysMin,
      closingDaysMax,
      inspectionDays,
      inspectionDescription,
    } = req.body;

    if (
      priceMultiplier === undefined ||
      closingDaysMin === undefined ||
      inspectionDays === undefined
    ) {
      return res.status(400).json({
        error: "Missing required offer terms fields (priceMultiplier, closingDaysMin, inspectionDays)",
      });
    }

    const newTerm = await createOfferTerms({
      priceMultiplier,
      closingDaysMin,
      closingDaysMax,
      inspectionDays,
      inspectionDescription,
    });

    return res.status(201).json(newTerm);
  } catch (error) {
    console.error("Failed to create offer terms:", error);
    return res.status(500).json({
      error: "Failed to create offer terms",
    });
  }
};

export const updateOfferTermsController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req, true);

    if (!id) {
      return res.status(400).json({
        error: "Valid offer terms ID is required",
      });
    }

    const {
      priceMultiplier,
      closingDaysMin,
      closingDaysMax,
      inspectionDays,
      inspectionDescription,
    } = req.body;

    const updatedTerm = await updateOfferTerms(id, {
      priceMultiplier,
      closingDaysMin,
      closingDaysMax,
      inspectionDays,
      inspectionDescription,
    });

    if (!updatedTerm) {
      return res.status(404).json({
        error: "Offer terms not found",
      });
    }

    return res.status(200).json(updatedTerm);
  } catch (error) {
    console.error("Failed to update offer terms:", error);
    return res.status(500).json({
      error: "Failed to update offer terms",
    });
  }
};

export const deleteOfferTermsController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req, true);

    if (!id) {
      return res.status(400).json({
        error: "Valid offer terms ID is required",
      });
    }

    const success = await deleteOfferTerms(id);

    if (!success) {
      return res.status(404).json({
        error: "Offer terms not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete offer terms:", error);
    return res.status(500).json({
      error: "Failed to delete offer terms",
    });
  }
};