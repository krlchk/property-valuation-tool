import { request } from "./api";
import type { UploadedPhoto } from "../types/photo";
import { getBlobContentHash, getFileContentHash } from "../utils/photoHash";

type PropertyPhotoResponse = {
  id: number;
  propertyId: string;
  url?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_TO_COMPONENT: Record<string, string> = {
  Roof: "roof",
  "Exterior paint": "exterior_paint",
  Windows: "windows",
  Kitchen: "kitchen",
  Bathrooms: "bathrooms",
  Floors: "floors",
  Doors: "doors",
  Landscaping: "landscaping",
  Garage: "garage",
  "Laundry room": "laundry_room",
  Deck: "deck",
};

const COMPONENT_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_COMPONENT).map(([category, component]) => [
    component,
    category,
  ]),
);

const toUploadedPhoto = (
  photo: PropertyPhotoResponse,
  sourceFile?: File,
  contentHash?: string,
): UploadedPhoto => ({
  id: String(photo.id),
  url: photo.url ?? "",
  name: sourceFile?.name ?? `photo-${photo.id}`,
  size: sourceFile?.size ?? 0,
  lastModified: sourceFile?.lastModified ?? 0,
  category: COMPONENT_TO_CATEGORY[photo.category] ?? photo.category,
  contentHash,
});

export const propertyPhotosService = {
  getByPropertyId: async (
    propertyId: string,
    signal?: AbortSignal,
  ): Promise<UploadedPhoto[]> => {
    const photos = await request<PropertyPhotoResponse[]>(
      `/property-photos/property/${encodeURIComponent(propertyId)}`,
      { signal },
    );
    return Promise.all(
      photos.map(async (photo) => {
        let contentHash: string | undefined;

        if (photo.url) {
          try {
            const response = await fetch(photo.url, { signal });
            if (response.ok) {
              contentHash = await getBlobContentHash(await response.blob());
            }
          } catch {
            // The photo can still be displayed and deleted if hashing fails.
          }
        }

        return toUploadedPhoto(photo, undefined, contentHash);
      }),
    );
  },

  upload: async (
    propertyId: string,
    file: File,
    category: string,
  ): Promise<UploadedPhoto> => {
    const component = CATEGORY_TO_COMPONENT[category];
    if (!component) throw new Error(`Unsupported photo category: ${category}`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("propertyId", propertyId);
    formData.append("category", component);

    const contentHash = await getFileContentHash(file);
    const photo = await request<PropertyPhotoResponse>("/property-photos", {
      method: "POST",
      body: formData,
    });

    return toUploadedPhoto(photo, file, contentHash);
  },

  remove: (photoId: string | number): Promise<void> =>
    request<void>(`/property-photos/${encodeURIComponent(String(photoId))}`, {
      method: "DELETE",
    }),
};
