import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import {
  createPropertyPhotoController,
  deletePropertyPhotoController,
  getPropertyPhotoByIdController,
  getPropertyPhotosController,
  updatePropertyPhotoController,
} from "./property-photo.controller";
import { IMAGE_EXTENSIONS } from "../../utils/image-extensions";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const isImage =
      file.mimetype.startsWith("image/") || IMAGE_EXTENSIONS.test(file.originalname);

    callback(null, isImage);
  },
});

const uploadPhoto = (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    console.error({ error });

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "Photo must be 25 MB or smaller" });
      return;
    }

    res.status(400).json({
      error: error instanceof Error ? error.message : "Invalid photo upload",
    });
  });
};

export const propertyPhotoRouter = Router();

propertyPhotoRouter.get("/property/:propertyId", getPropertyPhotosController);
propertyPhotoRouter.get("/:id", getPropertyPhotoByIdController);
propertyPhotoRouter.post("/", uploadPhoto, createPropertyPhotoController);
propertyPhotoRouter.patch("/:id", updatePropertyPhotoController);
propertyPhotoRouter.delete("/:id", deletePropertyPhotoController);
