import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import type { HealthResponse } from "@pvt/shared";

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
