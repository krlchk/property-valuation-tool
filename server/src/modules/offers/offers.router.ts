import { Router } from "express";
import {
  createOfferController,
  deleteOfferController,
  getAllOffersController,
  getOfferByIdController,
  getOfferHistoryController,
  updateOfferController,
} from "./offers.controller";

export const offersRouter = Router();

offersRouter.get("/", getAllOffersController);
offersRouter.get("/:id", getOfferByIdController);
offersRouter.post("/", createOfferController);
offersRouter.patch("/:id", updateOfferController);
offersRouter.delete("/:id", deleteOfferController);
offersRouter.get("/:id/history", getOfferHistoryController);
