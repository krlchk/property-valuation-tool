import { randomUUID } from "node:crypto";
import { supabase } from "../../lib/supabase";
import { processToWebp } from "./helpers/procces-file-upload";

const PROPERTY_BUCKET =
  process.env.SUPABASE_BUCKET ?? "property-photos";

export const uploadPropertyPhoto = async (input: {
  propertyId: string;
  buffer: Buffer;
}) => {
  const buffer = await processToWebp(input.buffer);
  const storagePath = `${input.propertyId}/${randomUUID()}.webp`;
  const bucket = supabase.storage.from(PROPERTY_BUCKET);

  const { error } = await bucket.upload(storagePath, buffer, {
    contentType: "image/webp",
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
    .from(PROPERTY_BUCKET)
    .remove([storagePath]);

  if (error) throw error;
};
