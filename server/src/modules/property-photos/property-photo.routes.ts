import { Router } from "express";
import multer from "multer";
import {
  createPropertyPhotoController,
  deletePropertyPhotoController,
  getPropertyPhotoByIdController,
  getPropertyPhotosController,
  updatePropertyPhotoController,
} from "./property-photo.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

export const propertyPhotoRouter = Router();

propertyPhotoRouter.get("/property/:propertyId", getPropertyPhotosController);
propertyPhotoRouter.get("/:id", getPropertyPhotoByIdController);
propertyPhotoRouter.post("/", upload.single("file"), createPropertyPhotoController);
propertyPhotoRouter.patch("/:id", updatePropertyPhotoController);
propertyPhotoRouter.delete("/:id", deletePropertyPhotoController);
