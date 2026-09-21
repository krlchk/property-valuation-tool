import type {
  AiReview,
  ComponentEvaluationGrade,
  ComponentGradeType,
  EvaluatedComponentResult,
  FetchAllResponse,
  PaginatedResponse,
  PropertyComponentCategory,
  PropertyPhoto,
  PropertyPhotoReview,
  PropertyRepairReview,
  PropertyReview,
  PropertyReviewResult,
  RepairEstimate,
  ReviewProcessResult,
  StoreComponentRepairEstimateInput,
  StorePropertyReviewInput,
} from "@pvt/shared";
import { PROPERTY_COMPONENT_CATEGORIES } from "../../utils/component-categories";
import { getComponentGradeByKeyAndGrade } from "../components-grade/components-grade.service";
import {
  getPropertyPhotoById,
  getPropertyPhotos,
} from "../property-photos/property-photo.service";
import { supabase } from "../../lib/supabase";
import {
  INSPECTOR_SYSTEM_PROMPT,
  OPENAI_API_URL,
  OPENAI_MODEL,
} from "../../utils/ai-review.constants";
import { reverse } from "dns";

//Persist reviews
export const storePropertyReview = async (input: StorePropertyReviewInput) => {
  const { data, error } = await supabase
    .from("ai_property_reviews")
    .insert({
      property_id: input.propertyId,
      result: input.result,
      condition_adjustment_pct: input.conditionAdjustmentPct,
      review_response: input.reviewResponse,
    })
    .select()
    .single();

  if (error) throw error;

  return mapPropertyAiReview(data);
};

export const saveComponentRepairReview = async (
  input: StoreComponentRepairEstimateInput,
) => {
  const { data, error } = await supabase
    .from("property_repair_reviews")
    .upsert(
      {
        property_id: input.propertyId,
        ai_property_review_id: input.aiPropertyReviewId,
        component_key: input.componentKey,
        grade: input.grade,
        estimated_repair_price: input.repairPrice ?? 0.0,
        review_response: input.reviewResponse,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "ai_property_review_id, component_key" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const saveBatchComponentRepairReviews = async (
  inputs: StoreComponentRepairEstimateInput[],
) => {
  if (!inputs.length) return [];

  const rows = inputs.map((input) => ({
    property_id: input.propertyId,
    ai_property_review_id: input.aiPropertyReviewId,
    component_key: input.componentKey,
    grade: input.grade,
    estimated_repair_price: input.repairPrice ?? null,
    review_response: input.reviewResponse,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("property_repair_reviews")
    .upsert(rows, { onConflict: "ai_property_review_id, component_key" })
    .select("*");

  if (error) throw error;
  return data;
};

export const getReviews = async (
  page: number,
  limit: number,
): Promise<FetchAllResponse<PropertyReview>> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("ai_property_reviews")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return {
    data: (data || []).map(mapPropertyAiReview),
    total: count ?? 0,
  };
};

export const getPropertyReviews = async (
  propertyId: string,
): Promise<PropertyReview[]> => {
  const { data, error } = await supabase
    .from("ai_property_reviews")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPropertyAiReview);
};

export const getAIReview = async (id: number) => {
  const { data, error } = await supabase
    .from("ai_property_reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  if (!data) {
    return null;
  }

  return mapPropertyAiReview(data);
};

export const deleteAIReview = async (id: number): Promise<boolean> => {
  const { error: repairDeleteError } = await supabase
    .from("property_repair_reviews")
    .delete()
    .eq("ai_property_review_id", id);

  if (repairDeleteError) throw repairDeleteError;

  const { error, count } = await supabase
    .from("ai_property_reviews")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;

  return count !== null && count > 0;
};

export const getPropertyReview = async (
  propertyId: string,
): Promise<PropertyReview | null> => {
  const { data, error } = await supabase
    .from("ai_property_reviews")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || data.result !== "success") return null;

  return mapPropertyAiReview(data);
};

export const getPropertyRepairReviews = async (aiPropertyReviewId: number) => {
  const { data, error } = await supabase
    .from("property_repair_reviews")
    .select("*")
    .eq("ai_property_review_id", aiPropertyReviewId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapToPropertyRepairReview);
};

export const requestPropertyReview = async (
  propertyId: string,
): Promise<ReviewProcessResult> => {
  const photos = await getPropertyPhotos(propertyId);
  const photosByCategory = groupPhotosByCategory(photos);

  // Evaluate all component categories concurrently
  const evaluations = await Promise.all(
    PROPERTY_COMPONENT_CATEGORIES.map(async (component) => {
      const categoryPhotos = photosByCategory.get(component) ?? [];
      return evaluateCategory(component, categoryPhotos);
    }),
  );

  // Filter for UNKNOWN or unresolvable components
  const failedComponents = evaluations.filter((e) => e.grade === "UNKNOWN");

  if (failedComponents.length > 0) {
    await storePropertyReview({
      propertyId,
      result: "failed",
      conditionAdjustmentPct: 0,
      reviewResponse: {
        propertyId,
        evaluations,
        totalAdjustmentPct: 0,
      },
    });

    return {
      status: "FAILED",
      propertyId,
      reason: "One or more components could not be evaluated.",
      unresolvedComponents: failedComponents.map((f) => ({
        component: f.component,
        reason: f.reason,
        recommendedAction: f.recommendedAction,
      })),
    };
  }

  // Calculate total condition adjustment % from DB rules
  let totalAdjustmentPct = 0;
  for (const evaluation of evaluations) {
    const gradePct = await getGradePercentage(
      evaluation.component,
      evaluation.grade,
    );
    evaluation.gradePercentage = gradePct;
    totalAdjustmentPct += gradePct;
  }

  // 1. Update the latest successful review, or insert one when none exists.
  // Failed reviews are intentionally never reused and are always inserted.
  const { data: existingReview, error: existingReviewError } = await supabase
    .from("ai_property_reviews")
    .select("id")
    .eq("property_id", propertyId)
    .eq("result", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingReviewError) throw existingReviewError;

  const reviewValues = {
    property_id: propertyId,
    result: "success",
    condition_adjustment_pct: totalAdjustmentPct,
    review_response: evaluations,
    updated_at: new Date().toISOString(),
  };

  const reviewQuery = existingReview
    ? supabase
        .from("ai_property_reviews")
        .update(reviewValues)
        .eq("id", existingReview.id)
    : supabase.from("ai_property_reviews").insert(reviewValues);

  const { data: storedReview, error: reviewError } = await reviewQuery
    .select()
    .single();

  if (reviewError) throw reviewError;

  // 2. Insert/upsert repair estimates with amount set to null
  const repairInputs = evaluations
    .filter(
      (evaluation) =>
        isScoredGrade(evaluation.grade) && evaluation.repairEstimate != null,
    )
    .map((evaluation) => ({
      property_id: propertyId,
      ai_property_review_id: storedReview.id,
      component_key: evaluation.component,
      grade: evaluation.grade,
      estimated_repair_price: null,
      review_response: evaluation.repairEstimate,
      updated_at: new Date().toISOString(),
    }));

  const { error: repairError } = await supabase
    .from("property_repair_reviews")
    .upsert(repairInputs, {
      onConflict: "ai_property_review_id, component_key",
    });

  if (repairError) throw repairError;

  return {
    status: "SUCCESS",
    propertyId,
    reviewId: storedReview.id,
    totalAdjustmentPct,
    evaluations,
  };
};

/** Reviews every configured component category for a property. */
export const reviewPropertyPhotos = async (
  propertyId: string,
): Promise<PropertyPhotoReview> => {
  const photos = await getPropertyPhotos(propertyId);
  const photosByCategory = groupPhotosByCategory(photos);

  const evaluations = await Promise.all(
    PROPERTY_COMPONENT_CATEGORIES.map(async (component) => {
      const categoryPhotos = photosByCategory.get(component) ?? [];
      return evaluateCategory(component, categoryPhotos);
    }),
  );

  return {
    propertyId,
    evaluations,
    totalAdjustmentPct: evaluations.reduce(
      (total, evaluation) => total + evaluation.gradePercentage,
      0,
    ),
  };
};

/** Reviews one uploaded photo, useful for incremental processing. */
export const reviewPropertyPhoto = async (
  photoId: number,
): Promise<EvaluatedComponentResult> => {
  const photo = await getPropertyPhotoById(photoId);
  if (!photo) throw new Error("Property photo not found");

  return evaluateCategory(photo.category, [photo]);
};

const evaluateCategory = async (
  component: PropertyComponentCategory,
  photos: PropertyPhoto[],
): Promise<EvaluatedComponentResult> => {
  const photoIds = photos.map((photo) => String(photo.id));

  if (photos.length === 0) {
    return {
      component,
      grade: "N/A",
      confidence: 0,
      reason: "No photos provided for this component category.",
      recommendedAction: `Upload photos for ${component}.`,
      photoIds: [],
      flaggedPhotoIds: [],
      gradePercentage: 0,
    };
  }

  const imageUrls = photos
    .map((photo) => photo.url)
    .filter((url): url is string => Boolean(url));

  if (imageUrls.length === 0) {
    return unknownEvaluation(
      component,
      photoIds,
      [],
      "The provided photos have no usable image URLs.",
    );
  }

  const aiReview = await requestAiReview(component, imageUrls);
  const gradePercentage = await getGradePercentage(component, aiReview.grade);

  return {
    component,
    ...aiReview,
    photoIds,
    gradePercentage,
  };
};

const groupPhotosByCategory = (photos: PropertyPhoto[]) => {
  const groups = new Map<PropertyComponentCategory, PropertyPhoto[]>();

  for (const photo of photos) {
    const categoryPhotos = groups.get(photo.category) ?? [];
    categoryPhotos.push(photo);
    groups.set(photo.category, categoryPhotos);
  }

  return groups;
};

const getGradePercentage = async (
  component: PropertyComponentCategory,
  grade: ComponentEvaluationGrade,
) => {
  if (!isScoredGrade(grade)) return 0;

  const componentGrade = await getComponentGradeByKeyAndGrade(component, grade);
  if (!componentGrade) {
    throw new Error(`No grade percentage configured for ${component}/${grade}`);
  }

  return componentGrade.gradePercentage;
};

const requestAiReview = async (
  component: PropertyComponentCategory,
  imageUrls: string[],
): Promise<AiReview> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY environment variable");

  const systemPrompt = INSPECTOR_SYSTEM_PROMPT.replaceAll(
    "{{component}}",
    component,
  );

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Evaluate the visible condition of the ${component} component across these photos. Return one category-level evaluation.`,
            },
            ...imageUrls.map((url) => ({
              type: "image_url",
              image_url: { url, detail: "high" },
            })),
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "property_component_review",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              grade: {
                type: "string",
                enum: ["GOOD", "FAIR", "BAD", "UNKNOWN"],
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              reason: { type: "string" },
              recommended_action: { type: ["string", "null"] },
              flagged_photo_ids: {
                type: "array",
                items: { type: "string" },
              },
              repair_estimate: {
                type: ["object", "null"],
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  repair_score: { type: "number", minimum: 0, maximum: 1 },
                  note: { type: "string" },
                  note_tone: {
                    type: ["string", "null"],
                    enum: ["warning", null],
                  },
                },
                required: ["title", "repair_score", "note", "note_tone"],
              },
            },
            required: [
              "grade",
              "confidence",
              "reason",
              "recommended_action",
              "flagged_photo_ids",
              "repair_estimate",
            ],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI review failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error("OpenAI returned an empty review");

  const parsed = JSON.parse(content) as {
    grade?: string;
    confidence?: number;
    reason?: string;
    recommended_action?: string | null;
    flagged_photo_ids?: string[];
    repair_estimate:
      | (Omit<RepairEstimate, "noteTone"> & { note_tone: "warning" | null })
      | null;
  };

  const parsedRepair = parsed.repair_estimate;
  const repairEstimate: RepairEstimate | null =
    parsed.grade === "UNKNOWN" || !parsedRepair
      ? null
      : {
          title: parsedRepair.title,
          note: parsedRepair.note,
          noteTone: parsedRepair.note_tone === "warning" ? "warning" : null,
        };

  if (
    !isEvaluationGrade(parsed.grade) ||
    typeof parsed.confidence !== "number" ||
    typeof parsed.reason !== "string"
  ) {
    throw new Error("OpenAI returned an invalid property component review");
  }

  if (parsed.grade === "UNKNOWN") {
    return {
      grade: "UNKNOWN",
      confidence: Math.min(Math.max(parsed.confidence, 0), 0.3),
      reason: parsed.reason,
      flaggedPhotoIds: parsed.flagged_photo_ids || [],
      recommendedAction:
        parsed.recommended_action ??
        `Upload higher quality or clearer photos for ${component}.`,
    };
  }

  return {
    grade: parsed.grade,
    confidence: Math.min(Math.max(parsed.confidence, 0), 1),
    reason: parsed.reason,
    recommendedAction: null,
    flaggedPhotoIds: [],
    repairEstimate,
  };
};

export const invalidateReview = async (propertyId: string) => {
  const review = await getPropertyReview(propertyId);

  if (!review) {
    return;
  }

  const { error: repairDeleteError } = await supabase
    .from("property_repair_reviews")
    .delete()
    .eq("ai_property_review_id", [review.id]);

  if (repairDeleteError) throw repairDeleteError;

  const { error: reviewDeleteError } = await supabase
    .from("ai_property_reviews")
    .delete()
    .eq("id", [review.id]);

  if (reviewDeleteError) throw reviewDeleteError;
};

const unknownEvaluation = (
  component: PropertyComponentCategory,
  photoIds: string[],
  flaggedPhotoIds: string[],
  reason: string,
): EvaluatedComponentResult => ({
  component,
  grade: "UNKNOWN",
  confidence: 0,
  reason,
  recommendedAction: `Upload higher quality or clearer photos for ${component}.`,
  photoIds,
  flaggedPhotoIds,
  gradePercentage: 0,
});

const isScoredGrade = (
  value: ComponentEvaluationGrade,
): value is ComponentGradeType =>
  value === "GOOD" || value === "FAIR" || value === "BAD";

const isEvaluationGrade = (value: unknown): value is ComponentEvaluationGrade =>
  value === "GOOD" ||
  value === "FAIR" ||
  value === "BAD" ||
  value === "UNKNOWN";

function mapToPropertyRepairReview(
  data: Record<string, any>,
): PropertyRepairReview {
  return {
    id: data.id,

    propertyId: data.property_id,
    aiPropertyReviewId: data.ai_property_review_id,

    componentKey: data.component_key,
    grade: data.grade,

    estimatedRepairPrice: data.estimated_repair_price ?? 0,

    reviewResponse: data.review_response,

    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapPropertyAiReview(data: Record<string, any>): PropertyReview {
  return {
    id: Number(data.id),
    propertyId: data.property_id,
    conditionAdjustmentPct: Number(data.condition_adjustment_pct),
    result: data.result as PropertyReviewResult,
    reviewResponse: data.review_response ?? {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
