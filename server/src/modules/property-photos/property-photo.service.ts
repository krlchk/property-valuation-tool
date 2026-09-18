import type { PropertyPhoto, PropertyComponentCategory } from "@pvt/shared";
import { supabase } from "../../lib/supabase";
import { deletePropertyPhotoObject } from "../storage/s3.service";
import { invalidateReview } from "../ai-review/ai-review.service";

type PropertyPhotoRow = Record<string, unknown>;

export const getPropertyPhotos = async (
  propertyId: string,
): Promise<PropertyPhoto[]> => {
  const { data, error } = await supabase
    .from("property_photos")
    .select("id, property_id, url, category, created_at, updated_at")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapPropertyPhoto);
};

export const getPropertyPhotoById = async (
  id: number,
): Promise<PropertyPhoto | null> => {
  const { data, error } = await supabase
    .from("property_photos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapPropertyPhoto(data) : null;
};

export const createPropertyPhoto = async (input: {
  propertyId: string;
  url: string;
  storagePath: string;
  category: PropertyComponentCategory;
}): Promise<PropertyPhoto> => {
  const { data, error } = await supabase
    .from("property_photos")
    .insert({
      property_id: input.propertyId,
      url: input.url,
      storage_path: input.storagePath,
      category: input.category,
    })
    .select("id, property_id, url, category, created_at, updated_at")
    .single();

  if (error) throw error;

  await invalidateReview(input.propertyId);
  return mapPropertyPhoto(data);
};

export const updatePropertyPhoto = async (
  id: number,
  category: PropertyComponentCategory,
): Promise<PropertyPhoto | null> => {
  const { data, error } = await supabase
    .from("property_photos")
    .update({ category, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, property_id, url, category, created_at, updated_at")
    .maybeSingle();

  if (error) throw error;
  return data ? mapPropertyPhoto(data) : null;
};

export const deletePropertyPhoto = async (id: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from("property_photos")
    .select("storage_path, property_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  await deletePropertyPhotoObject(data.storage_path as string);

  const { error: deleteError } = await supabase
    .from("property_photos")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;

  await invalidateReview(String(data.property_id));
  return true;
};

function mapPropertyPhoto(data: PropertyPhotoRow): PropertyPhoto {
  return {
    id: Number(data.id),
    propertyId: String(data.property_id),
    url: typeof data.url === "string" ? data.url : undefined,
    category: data.category as PropertyComponentCategory,
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };
}
