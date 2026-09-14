import { Router } from "express";
import { createPropertyController } from "./property.controller";

export const propertyRouter = Router();

propertyRouter.post("/", createPropertyController);
