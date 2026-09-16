import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import type { HealthResponse } from "@pvt/shared";
import { propertyRouter } from "./modules/properties/property.routes";
import { addressRouter } from "./modules/addresses/address.routes";
import { offerTermsRouter } from "./modules/offer-terms/offer-terms.routes";
import { propertyPhotoRouter } from "./modules/property-photos/property-photo.routes";
import { componentsGradeRouter } from "./modules/components-grade/components-grade.route";
import { aiReviewRouter } from "./modules/ai-review/ai-review.routes";
import { userRouter } from "./modules/users/users.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const body: HealthResponse = {
    status: "ok",
    message: "Property Valuation API is running",
  };
  res.json(body);
});

app.use("/api/properties", propertyRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/components-grade", componentsGradeRouter);
app.use("/api/ai-reviews", aiReviewRouter);
app.use("/api/offer-terms", offerTermsRouter);
app.use("/api/property-photos", propertyPhotoRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
