import { PropertyComponentCategory } from "@pvt/shared";

export const PROPERTY_COMPONENT_CATEGORIES = [
  "roof",
  "kitchen",
  "bathrooms",
  "floors",
  "exterior_paint",
  "windows",
  "doors",
  "landscaping",
  "garage",
  "laundry_room",
  "deck",
] as const satisfies readonly PropertyComponentCategory[];