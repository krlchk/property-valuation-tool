import { Router } from "express";
import {
  createPropertyController,
  deletePropertyController,
  estimatePropertyPriceController,
  getPropertyByIdController,
  updatePropertyController,
} from "./property.controller";

export const propertyRouter = Router();

propertyRouter.get("/:id", getPropertyByIdController);
propertyRouter.post("/", createPropertyController);
propertyRouter.post("/estimate", estimatePropertyPriceController);
propertyRouter.patch("/", updatePropertyController);
propertyRouter.delete("/:id", deletePropertyController);
