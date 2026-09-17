import { Router } from "express";
import {
  getAllComponentGradesController,
  getComponentGradeByKeyAndGradeController,
  updateComponentGradeController,
  updateComponentGradeByIdController,
  deleteComponentGradeByIdController,
} from "./components-grade.controller";

export const componentsGradeRouter = Router();

componentsGradeRouter.get("/", getAllComponentGradesController);
componentsGradeRouter.get("/:componentKey/:grade", getComponentGradeByKeyAndGradeController);
componentsGradeRouter.patch("/:componentKey/:grade", updateComponentGradeController);
componentsGradeRouter.patch("/:id", updateComponentGradeByIdController);
componentsGradeRouter.delete("/:id", deleteComponentGradeByIdController);