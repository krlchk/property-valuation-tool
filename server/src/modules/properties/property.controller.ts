import type { Request, Response } from "express";
import { createProperty } from "./property.service";

export const createPropertyController = async (req: Request, res: Response) => {
  try {
    const { addressLine1, city, state, postalCode } = req.body;
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
    });
    return res.status(201).json(property);
  } catch (error) {
    console.error("Failed to create property:", error);
    return res.status(500).json({
      error: "Failed to create property",
    });
  }
};
