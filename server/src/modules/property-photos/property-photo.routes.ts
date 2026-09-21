import { Router } from "express";
import {
  createPropertyPhotoController,
  deletePropertyPhotoController,
  getPropertyPhotoByIdController,
  getPropertyPhotosController,
  updatePropertyPhotoController,
} from "./property-photo.controller";
import { uploadPhoto } from "../../middlewares/uppload-image";

export const propertyPhotoRouter = Router();

propertyPhotoRouter.get("/property/:propertyId", getPropertyPhotosController);
propertyPhotoRouter.get("/:id", getPropertyPhotoByIdController);
propertyPhotoRouter.post("/", uploadPhoto, createPropertyPhotoController);
propertyPhotoRouter.patch("/:id", updatePropertyPhotoController);
propertyPhotoRouter.delete("/:id", deletePropertyPhotoController);
