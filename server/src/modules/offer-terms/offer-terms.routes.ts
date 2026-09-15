import { Router } from "express";
import {
  getAllOfferTermsController,
  getOfferTermsByIdController,
  createOfferTermsController,
  updateOfferTermsController,
  deleteOfferTermsController,
} from "./offer-terms.controller";

export const offerTermsRouter = Router();

offerTermsRouter.get("/", getAllOfferTermsController);
offerTermsRouter.get("/:id", getOfferTermsByIdController);
offerTermsRouter.post("/", createOfferTermsController);
offerTermsRouter.patch("/:id", updateOfferTermsController);
offerTermsRouter.delete("/:id", deleteOfferTermsController);
