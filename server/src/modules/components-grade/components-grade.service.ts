import type {
  PropertyComponentGrade,
  PropertyComponentCategory,
  ComponentGradeType,
} from "@pvt/shared";
import { supabase } from "../../lib/supabase";

type PropertyComponentGradeRow = Record<string, unknown>;

export const getAllComponentGrades = async (): Promise<PropertyComponentGrade[]> => {
  const { data, error } = await supabase
    .from("property_component_grades")
    .select("id, component_key, grade, grade_percentage, created_at, updated_at")
    .order("component_key", { ascending: true })
    .order("grade", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapPropertyComponentGrade);
};

export const getComponentGradeByKeyAndGrade = async (
  componentKey: PropertyComponentCategory,
  grade: ComponentGradeType
): Promise<PropertyComponentGrade | null> => {
  const { data, error } = await supabase
    .from("property_component_grades")
    .select("id, component_key, grade, grade_percentage, created_at, updated_at")
    .eq("component_key", componentKey)
    .eq("grade", grade)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPropertyComponentGrade(data) : null;
};

export const updateComponentGradePercentage = async (
  componentKey: PropertyComponentCategory,
  grade: ComponentGradeType,
  gradePercentage: number
): Promise<PropertyComponentGrade | null> => {
  const { data, error } = await supabase
    .from("property_component_grades")
    .update({
      grade_percentage: gradePercentage,
      updated_at: new Date().toISOString(),
    })
    .eq("component_key", componentKey)
    .eq("grade", grade)
    .select("id, component_key, grade, grade_percentage, created_at, updated_at")
    .maybeSingle();

  if (error) throw error;
  return data ? mapPropertyComponentGrade(data) : null;
};

export const updateComponentGradeById = async (
  id: number,
  gradePercentage: number
): Promise<PropertyComponentGrade | null> => {
  const { data, error } = await supabase
    .from("property_component_grades")
    .update({
      grade_percentage: gradePercentage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, component_key, grade, grade_percentage, created_at, updated_at")
    .maybeSingle();

  if (error) throw error;
  return data ? mapPropertyComponentGrade(data) : null;
};

export const deleteComponentGradeById = async (id: number): Promise<boolean> => {
  const { error, count } = await supabase
    .from("property_component_grade")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
};

function mapPropertyComponentGrade (
  data: PropertyComponentGradeRow
): PropertyComponentGrade {
    return {
        id: Number(data.id),
        componentKey: data.component_key as PropertyComponentCategory,
        grade: data.grade as ComponentGradeType,
        gradePercentage: Number(data.grade_percentage),
        createdAt: String(data.created_at),
        updatedAt: String(data.updated_at),
    }
}