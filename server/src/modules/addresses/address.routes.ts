import { Router } from "express";
import {
  getAddressDetailsController,
  searchAddressesController,
} from "./address.controller";

export const addressRouter = Router();

addressRouter.get("/search", searchAddressesController);
addressRouter.get("/:placeId", getAddressDetailsController);
