import { randomUUID } from "node:crypto";
import path from "node:path";
import { supabase } from "../../lib/supabase";

const PROPERTY_PHOTOS_BUCKET =
  process.env.SUPABASE_PROPERTY_PHOTOS_BUCKET ?? "property-photos";

const safeFileName = (name: string) => {
  const extension = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${randomUUID()}${extension}`;
};

export const uploadPropertyPhoto = async (input: {
  propertyId: string;
  buffer: Buffer;
  contentType: string;
  originalName: string;
}) => {
  const storagePath = `${input.propertyId}/${safeFileName(input.originalName)}`;
  const bucket = supabase.storage.from(PROPERTY_PHOTOS_BUCKET);

  const { error } = await bucket.upload(storagePath, input.buffer, {
    contentType: input.contentType,
    upsert: false,
  });

  if (error) throw error;

  const { data } = bucket.getPublicUrl(storagePath);

  return {
    storagePath,
    url: data.publicUrl,
  };
};

export const deletePropertyPhotoObject = async (storagePath: string) => {
  const { error } = await supabase.storage
    .from(PROPERTY_PHOTOS_BUCKET)
    .remove([storagePath]);

  if (error) throw error;
};
