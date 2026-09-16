import type {
  AIComponentEvaluation,
  ComponentEvaluationGrade,
  ComponentGradeType,
  EvaluatedComponentResult,
  PropertyComponentCategory,
  PropertyPhoto,
} from "@pvt/shared";
import { PROPERTY_COMPONENT_CATEGORIES } from "../../utils/component-categories";
import { getComponentGradeByKeyAndGrade } from "../components-grade/components-grade.service";
import {
  getPropertyPhotoById,
  getPropertyPhotos,
} from "../property-photos/property-photo.service";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const INSPECTOR_SYSTEM_PROMPT = `You are an expert residential real estate property condition inspector. Your job is to analyze photos of a house component and evaluate its visible physical condition.

CRITICAL STEP 1 - IMAGE RELEVANCE & CONTENT VALIDATION:
Before evaluating condition, inspect every image to verify if it depicts a real, real-estate photo of the target component.
- If the photo contains non-real-estate content (e.g., cartoons, illustrations, memes, pets, people, generic objects, indoor scenes when inspecting exterior roofs/landscaping), you MUST set grade to "UNKNOWN".
- Do NOT guess, hallucinate, or default to "FAIR" or "GOOD" for irrelevant or unidentifiable images.

CRITICAL STEP 2 - GRADING CRITERIA (Only apply if photos depict the valid target component):
- GOOD: Modern or updated appearance, well-maintained, minimal to no visible wear, no damage.
- FAIR: Functional and usable, but dated appearance, showing moderate wear or minor cosmetic updates needed.
- BAD: Heavily outdated, deteriorated, damaged, missing parts, or visibly in need of significant renovation.
- UNKNOWN: The photo provided is non-real-estate content, irrelevant to the target component, blurry, obstructed, or lacks sufficient visibility to evaluate.


Rules:
1. Grade ONLY visible physical condition. Never invent hidden defects (e.g., do not claim a roof leaks unless water damage or missing shingles are visibly apparent).
2. If grade is UNKNOWN because photos are irrelevant or non-real-estate images, set recommended_action to: "Uploaded photos appear irrelevant or do not show {{component}}. Please upload actual photos of the {{component}}."
3. If grade is UNKNOWN due to quality/lighting, set recommended_action to: "Upload higher quality or clearer photos for {{component}}."
4. If grade is GOOD, FAIR, or BAD, set recommended_action to null.
5. Confidence must be a float between 0.00 and 1.00 representing your certainty. UNKNOWN confidence must be between 0.00 and 0.30. Set confidence between 0.00 and 0.10 for irrelevant/non-real-estate images.
6. Provide a concise, clear reason in 1-2 sentences.
7. Return only the requested JSON object.`;

type AiReview = Omit<AIComponentEvaluation, "component" | "photoIds">;

export type PropertyPhotoReview = {
  propertyId: string;
  evaluations: EvaluatedComponentResult[];
  totalAdjustmentPct: number;
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

  const systemPrompt = INSPECTOR_SYSTEM_PROMPT.replaceAll("{{component}}", component);

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
            },
            required: [
              "grade",
              "confidence",
              "reason",
              "recommended_action",
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
  };
};

const unknownEvaluation = (
  component: PropertyComponentCategory,
  photoIds: string[],
  reason: string,
): EvaluatedComponentResult => ({
  component,
  grade: "UNKNOWN",
  confidence: 0,
  reason,
  recommendedAction: `Upload higher quality or clearer photos for ${component}.`,
  photoIds,
  gradePercentage: 0,
});

const isScoredGrade = (
  value: ComponentEvaluationGrade,
): value is ComponentGradeType =>
  value === "GOOD" || value === "FAIR" || value === "BAD";

const isEvaluationGrade = (
  value: unknown,
): value is ComponentEvaluationGrade =>
  value === "GOOD" ||
  value === "FAIR" ||
  value === "BAD" ||
  value === "UNKNOWN";
