import type { Request, Response, NextFunction } from "express";
import {
  calculatePropertyEstimate,
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
} from "./property.service";
import { getIdFromParam } from "../../utils/query";
import { EstimatePropertyRequest } from "@pvt/shared";

export const getAllPropertiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { page, limit } = req.pagination;

    const result = await getAllProperties(page, limit);

    return res.status(200).json({
      items: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch properties:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Failed to fetch properties" });
  }
};

export const getPropertyByIdController = async (
  req: Request,
  res: Response,
) => {
  const { id } = getIdFromParam(req);

  if (!id) {
    return res.status(400).json({ error: "Property ID is required" });
  }

  const property = await getPropertyById(id);

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  return res.status(200).json(property);
};

export const createPropertyController = async (req: Request, res: Response) => {
  try {
    const {
      addressLine1,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      addressProvider,
      providerPlaceId,
      startingValue,
    } = req.body;

    if (!addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({
        error: "Missing required property fields",
      });
    }

    const property = await createProperty({
      addressLine1,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      addressProvider,
      providerPlaceId,
      startingValue,
    });

    return res.status(201).json(property);
  } catch (error) {
    console.error("Failed to create property:", error);
    return res.status(500).json({
      error: "Failed to create property",
    });
  }
};

export const estimatePropertyPriceController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { propId } = req.body as EstimatePropertyRequest;

    const estimate = await calculatePropertyEstimate(propId);

    return res.json(estimate);
  } catch (error) {
    console.error("Failed to estimate property price:", error);

    return res.status(500).json({
      error: "Failed to estimate property price",
    });
  }
};

export const updatePropertyController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);

    if (!id) {
      return res.status(400).json({
        error: "Property ID is required",
      });
    }

    const {
      addressLine1,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      addressProvider,
      providerPlaceId,
      squareFeet,
      startingValue,
      offerTermsId,
      userId,
    } = req.body;

    const property = await updateProperty(id, {
      addressLine1,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      addressProvider,
      providerPlaceId,
      squareFeet,
      startingValue,
      offerTermsId,
      userId,
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found",
      });
    }

    return res.status(200).json(property);
  } catch (error) {
    console.error("Failed to update property:", error);
    return res.status(500).json({
      error: "Failed to update property",
    });
  }
};

export const deletePropertyController = async (req: Request, res: Response) => {
  const { id } = getIdFromParam(req);

  if (!id) {
    return res.status(400).json({ error: "Property ID is required" });
  }

  try {
    const affected = await deleteProperty(id);

    if (!affected) {
      throw new Error();
    }

    return res.status(200).json({ deleted: true, id });
  } catch (error) {
    console.error("Failed to delete property: " + error);

    return res.status(500).json({
      error: "Failed to delete property",
    });
  }
};
