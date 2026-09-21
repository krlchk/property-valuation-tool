import { Router } from "express";
import {
  createPropertyController,
  deletePropertyController,
  estimatePropertyPriceController,
  getAllPropertiesController,
  getPropertyByIdController,
  updatePropertyController,
} from "./property.controller";
import { applyPagination } from "../../middlewares/pagination";

export const propertyRouter = Router();

propertyRouter.get("/", applyPagination(), getAllPropertiesController);
propertyRouter.get("/:id", getPropertyByIdController);
propertyRouter.post("/", createPropertyController);
propertyRouter.post("/estimate", estimatePropertyPriceController);
propertyRouter.patch("/:id", updatePropertyController);
propertyRouter.delete("/:id", deletePropertyController);
