import type { Request, Response } from "express";
import type {
  PropertyComponentCategory,
  ComponentGradeType,
} from "@pvt/shared";
import { PROPERTY_COMPONENT_CATEGORIES } from "../../utils/component-categories";
import {
  deleteComponentGradeById,
  getAllComponentGrades,
  getComponentGradeByKeyAndGrade,
  updateComponentGradeById,
  updateComponentGradePercentage,
} from "./components-grade.service";
import { getIdFromParam } from "../../utils/query";

const VALID_GRADES: ComponentGradeType[] = ["GOOD", "FAIR", "BAD"];

const isComponentCategory = (val: unknown): val is PropertyComponentCategory =>
  typeof val === "string" &&
  (PROPERTY_COMPONENT_CATEGORIES as readonly string[]).includes(val);

const isGradeType = (val: unknown): val is ComponentGradeType =>
  typeof val === "string" && VALID_GRADES.includes(val as ComponentGradeType);

export const getAllComponentGradesController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const grades = await getAllComponentGrades();
    return res.status(200).json(grades);
  } catch (error) {
    console.error("Failed to fetch component grades:", error);
    return res.status(500).json({ error: "Failed to fetch component grades" });
  }
};

export const getComponentGradeByKeyAndGradeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { componentKey, grade } = req.params;

    if (!isComponentCategory(componentKey) || !isGradeType(grade)) {
      return res
        .status(400)
        .json({ error: "Invalid componentKey or grade parameter" });
    }

    const item = await getComponentGradeByKeyAndGrade(componentKey, grade);
    return item
      ? res.status(200).json(item)
      : res.status(404).json({ error: "Component grade rule not found" });
  } catch (error) {
    console.error("Failed to fetch component grade rule:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch component grade rule" });
  }
};

export const updateComponentGradeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { componentKey, grade } = req.params;
    const { gradePercentage } = req.body;

    if (!isComponentCategory(componentKey) || !isGradeType(grade)) {
      return res
        .status(400)
        .json({ error: "Invalid componentKey or grade parameter" });
    }

    if (
      typeof gradePercentage !== "number" ||
      gradePercentage < -10 ||
      gradePercentage > 0
    ) {
      return res
        .status(400)
        .json({
          error: "gradePercentage must be a number between -10.00 and 0.00",
        });
    }

    const updated = await updateComponentGradePercentage(
      componentKey,
      grade,
      gradePercentage,
    );
    return updated
      ? res.status(200).json(updated)
      : res.status(404).json({ error: "Component grade rule not found" });
  } catch (error: any) {
    console.error("Failed to update component grade percentage:", error);
    return res
      .status(500)
      .json({
        error: error?.message || "Failed to update component grade rule",
      });
  }
};

export const updateComponentGradeByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = getIdFromParam(req, true);
    const { gradePercentage } = req.body;

    if (
      typeof gradePercentage !== "number" ||
      gradePercentage < -10 ||
      gradePercentage > 0
    ) {
      return res
        .status(400)
        .json({
          error: "gradePercentage must be a number between -10.00 and 0.00",
        });
    }

    const updated = await updateComponentGradeById(id, gradePercentage);
    return updated
      ? res.status(200).json(updated)
      : res.status(404).json({ error: "Component grade rule not found" });
  } catch (error: any) {
    console.error("Failed to update component grade percentage by ID:", error);
    return res
      .status(500)
      .json({
        error: error?.message || "Failed to update component grade rule",
      });
  }
};

export const deleteComponentGradeByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = getIdFromParam(req, true);

    const deleted = await deleteComponentGradeById(id);
    return deleted
      ? res.status(200).json({ deleted: true, id })
      : res.status(404).json({ error: "Component grade rule not found" });
  } catch (error) {
    console.error("Failed to delete component grade by ID:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete component grade rule" });
  }
};
