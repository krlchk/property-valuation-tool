import type { Request, Response } from "express";
import type { PropertyComponentCategory } from "@pvt/shared";
import { getIdFromParam } from "../../utils/query";
import {
  createPropertyPhoto,
  deletePropertyPhoto,
  getPropertyPhotoById,
  getPropertyPhotos,
  updatePropertyPhoto,
} from "./property-photo.service";
import {
  deletePropertyPhotoObject,
  uploadPropertyPhoto,
} from "../storage/s3.service";
import { PROPERTY_COMPONENT_CATEGORIES } from "../../utils/component-categories";

const isCategory = (value: unknown): value is PropertyComponentCategory =>
  typeof value === "string" &&
  (PROPERTY_COMPONENT_CATEGORIES as readonly string[]).includes(value);

const parsePhotoId = (req: Request) => {
  const { id } = getIdFromParam(req, true);
  return id;
};

export const getPropertyPhotosController = async (
  req: Request,
  res: Response,
) => {
  try {
    const rawPropertyId = req.params.propertyId;
    const propertyId = Array.isArray(rawPropertyId)
      ? rawPropertyId[0]
      : rawPropertyId;
    if (!propertyId)
      return res.status(400).json({ error: "Property ID is required" });

    return res.status(200).json(await getPropertyPhotos(propertyId));
  } catch (error) {
    console.error("Failed to fetch property photos:", error);
    return res.status(500).json({ error: "Failed to fetch property photos" });
  }
};

export const getPropertyPhotoByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parsePhotoId(req);
    if (!id)
      return res.status(400).json({ error: "Valid photo ID is required" });

    const photo = await getPropertyPhotoById(id);
    return photo
      ? res.status(200).json(photo)
      : res.status(404).json({ error: "Property photo not found" });
  } catch (error) {
    console.error("Failed to fetch property photo:", error);
    return res.status(500).json({ error: "Failed to fetch property photo" });
  }
};

export const createPropertyPhotoController = async (
  req: Request,
  res: Response,
) => {
  try {
    const propertyId =
      typeof req.body.propertyId === "string" ? req.body.propertyId : "";
    const category = req.body.category;

    if (!propertyId || !isCategory(category)) {
      return res
        .status(400)
        .json({ error: "propertyId and a valid category are required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "A photo file is required" });
    }

    const uploaded = await uploadPropertyPhoto({
      propertyId,
      buffer: req.file.buffer,
    });

    try {
      const photo = await createPropertyPhoto({
        propertyId,
        category,
        url: uploaded.url,
        storagePath: uploaded.storagePath,
      });
      return res.status(201).json(photo);
    } catch (error) {
      console.error("Failed to save property photo metadata:", error);
      await deletePropertyPhotoObject(uploaded.storagePath).catch(
        (cleanupError) => {
          console.error(
            "Failed to clean up uploaded property photo:",
            cleanupError,
          );
        },
      );
      return res.status(500).json({ error: "Failed to save property photo" });
    }
  } catch (error) {
    console.error("Failed to upload property photo:", error);
    return res.status(500).json({ error: "Failed to upload property photo" });
  }
};

export const updatePropertyPhotoController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parsePhotoId(req);
    if (!id)
      return res.status(400).json({ error: "Valid photo ID is required" });
    if (!isCategory(req.body.category)) {
      return res.status(400).json({ error: "A valid category is required" });
    }

    const photo = await updatePropertyPhoto(id, req.body.category);
    return photo
      ? res.status(200).json(photo)
      : res.status(404).json({ error: "Property photo not found" });
  } catch (error) {
    console.error("Failed to update property photo:", error);
    return res.status(500).json({ error: "Failed to update property photo" });
  }
};

export const deletePropertyPhotoController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = parsePhotoId(req);
    if (!id)
      return res.status(400).json({ error: "Valid photo ID is required" });

    const deleted = await deletePropertyPhoto(id);
    return deleted
      ? res.status(204).send()
      : res.status(404).json({ error: "Property photo not found" });
  } catch (error) {
    console.error("Failed to delete property photo:", error);
    return res.status(500).json({ error: "Failed to delete property photo" });
  }
};
