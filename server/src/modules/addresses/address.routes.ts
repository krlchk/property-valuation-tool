import { Router } from "express";
import {
  getAddressDetailsController,
  reverseGeocodeController,
  searchAddressesController,
} from "./address.controller";

export const addressRouter = Router();

addressRouter.get("/search", searchAddressesController);
addressRouter.get("/reverse", reverseGeocodeController);
addressRouter.get("/:placeId", getAddressDetailsController);
