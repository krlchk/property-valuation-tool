import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddPhotosDialog } from "../components/AddPhotosDialog";
import { CategoryPhotosDialog } from "../components/CategoryPhotosDialog";
import { CategoryTile } from "../components/CategoryTile";
import { ImageLoader } from "../components/ImageLoader";
import { ArrowUpIcon, PlusIcon } from "../components/icons";
import { ProgressBar } from "../components/ProgressBar";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";
import { dedupeFiles } from "../utils/photoFiles";
import { propertyPhotosService } from "../services/property-photos.service";
import type { UploadedPhoto } from "../types/photo";

const TARGET_PHOTOS = 10;
const MINIMUM_PHOTOS = Math.ceil(TARGET_PHOTOS / 2);

// MVP: fixed set of 11 categories — no custom categories for now (see
// `handleAddCategory` / `AddPhotosDialog` below).
const PHOTO_CATEGORIES = [
  "Roof",
  "Exterior paint",
  "Windows",
  "Kitchen",
  "Bathrooms",
  "Floors",
  "Doors",
  "Landscaping",
  "Garage",
  "Laundry room",
  "Deck",
];

const DIRECT_PHOTOS_MAILTO = "mailto:photos@example.com";

const PropertyPhotosSkeleton = () => (
  <div
    aria-busy="true"
    aria-label="Loading property photos"
    className="animate-pulse"
  >
    <div className="h-12 w-4/5 rounded-xl bg-gray-200" />
    <div className="mt-4 h-4 w-full rounded bg-gray-200" />
    <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />

    <div className="mt-6 flex flex-wrap gap-2">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="h-8 w-20 rounded-full bg-blue-100" />
      ))}
    </div>

    <div className="mt-6 h-28 rounded-2xl bg-blue-100" />
    <div className="mt-6 h-40 rounded-2xl bg-yellow-50" />

    <div className="mt-8 grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="aspect-square rounded-2xl bg-gray-200" />
      ))}
    </div>

    <div className="mt-6 h-32 rounded-2xl bg-yellow-100" />
    <div className="mt-6 h-16 rounded-3xl bg-gray-200" />
    <div className="mt-6 h-12 rounded-full bg-gray-200" />
  </div>
);

export const PropertyPhotosPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { hydratedPropertyId, property, photos, setPhotos } = useValuation();

  const [categories] = useState<string[]>(PHOTO_CATEGORIES); // setter unused while custom categories are off
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<UploadedPhoto[]>([]);
  const photosRef = useRef(photos);
  const pendingPhotosRef = useRef(pendingPhotos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    pendingPhotosRef.current = pendingPhotos;
  }, [pendingPhotos]);

  const clearPendingPhotos = () => {
    for (const photo of pendingPhotosRef.current) {
      if (photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);
    }
    pendingPhotosRef.current = [];
    setPendingPhotos([]);
  };

  useEffect(() => {
    return () => {
      for (const photo of [...photosRef.current, ...pendingPhotosRef.current]) {
        if (photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);
      }
    };
  }, []);

  const progress = Math.min(photos.length / TARGET_PHOTOS, 1);
  const coveragePct = Math.round(progress * 100);
  const remaining = Math.max(TARGET_PHOTOS - photos.length, 0);
  const canContinue = photos.length >= MINIMUM_PHOTOS;
  const atLimit = photos.length >= TARGET_PHOTOS;

  const locationLabel = property
    ? `${property.addressLine1}, ${property.city}`
    : `Property #${addressId}`;

  const photosIn = (category: string) =>
    photos.filter((photo) => photo.category === category);

  // MVP: category list is fixed at PHOTO_CATEGORIES, so this (and the
  // setter above) is unused for now. Re-enable together with the "Other"
  // chip in AddPhotosDialog.
  // const handleAddCategory = (name: string) => {
  //   setCategories((prev) => [...prev, name]);
  // };

  const handleAddPhotos = async (files: File[], category: string) => {
    const propertyId = property?.id ?? addressId;
    if (!propertyId) {
      setPhotoError("Unable to identify this property.");
      return;
    }

    const room = Math.max(TARGET_PHOTOS - photos.length, 0);
    const accepted = dedupeFiles(files, photos).slice(0, room);
    if (accepted.length === 0) return;

    setPhotoError(null);
    setIsUploading(true);
    const pending = accepted.map((file, index): UploadedPhoto => ({
      id: `pending-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      category,
    }));
    pendingPhotosRef.current = pending;
    setPendingPhotos(pending);

    try {
      const results = await Promise.allSettled(
        accepted.map((file) =>
          propertyPhotosService.upload(propertyId, file, category),
        ),
      );
      const additions = results
        .filter(
          (result): result is PromiseFulfilledResult<UploadedPhoto> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);
      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      if (failures.length > 0) {
        console.error("Failed to upload property photo:", failures[0].reason);
        await Promise.allSettled(
          additions.map((photo) => propertyPhotosService.remove(photo.id)),
        );
        setPhotoError(
          failures[0].reason instanceof Error
            ? failures[0].reason.message
            : "Some photos could not be uploaded. Please try again.",
        );
        clearPendingPhotos();
        return;
      }

      clearPendingPhotos();
      const next = [...photosRef.current, ...additions];
      setPhotos(next);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await propertyPhotosService.remove(id);
    } catch (error) {
      console.error("Failed to delete property photo:", error);
      setPhotoError("Failed to delete the photo. Please try again.");
      return;
    }

    const target = photosRef.current.find((photo) => photo.id === id);
    if (target?.url.startsWith("blob:")) URL.revokeObjectURL(target.url);

    const next = photosRef.current.filter((photo) => photo.id !== id);
    setPhotos(next);

    if (viewingCategory && !next.some((p) => p.category === viewingCategory)) {
      setViewingCategory(null);
    }
  };

  const usedCategories = categories.filter((category) =>
    photos.some((photo) => photo.category === category),
  );

  const isHydrating = hydratedPropertyId !== addressId;

  if (isHydrating) {
    return (
      <StepsWrapper
        stepHeaderCurrent={2}
        stepHeaderTotal={4}
        stepHeaderLabel="Step 2 of 4 · Photos"
        stepHeaderOnBack={() => navigate(`/?propertyId=${addressId}`)}
      >
        <div className="mt-5">
          <PropertyPhotosSkeleton />
        </div>
      </StepsWrapper>
    );
  }

  return (
    <StepsWrapper
      stepHeaderCurrent={2}
      stepHeaderTotal={4}
      stepHeaderLabel="Step 2 of 4 · Photos"
      stepHeaderOnBack={() => navigate(`/?propertyId=${addressId}`)}
    >
      <div className="mt-5">
        {photoError && (
          <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            {photoError}
          </p>
        )}
        <h1 className="font-serif text-hero leading-[1.15]">
          Add 10 photos of your property
        </h1>

        <p className="mt-3 text-body-sm text-slate-600">
          {locationLabel} — the first {TARGET_PHOTOS} photos are what our AI
          grades, so cover the whole place.
        </p>

        <ul className="mt-6 flex flex-wrap gap-2 text-xs">
          {categories.map((category) => (
            <li
              key={category}
              className="rounded-full bg-blue-100 px-4 py-2 text-slate-800"
            >
              {category}
            </li>
          ))}
          <li className="rounded-full bg-gray-100 px-4 py-2 text-gray-400">
            … and anything broken
          </li>
        </ul>

        <div className="mt-6 rounded-2xl bg-blue-100 p-4">
          <div className="flex flex-nowrap items-center justify-between gap-2 text-xs font-semibold text-slate-800 sm:text-sm">
            <span className="min-w-0 flex-1 truncate whitespace-nowrap">
              Every photo tightens the offer
            </span>
            <span className="shrink-0 whitespace-nowrap text-slate-500">
              {Math.min(photos.length, TARGET_PHOTOS)} / {TARGET_PHOTOS}
            </span>
          </div>

          <div className="relative mt-3 h-3.5">
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white" />
            <div
              className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-custom-yellow transition-[width] duration-300"
              style={{ width: `${progress * 100}%` }}
            />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-custom-yellow shadow-sm transition-[left] duration-300"
              style={{
                left: `clamp(0.4375rem, ${progress * 100}%, calc(100% - 0.4375rem))`,
              }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-600">
            {photos.length === 0
              ? "With no photos we can only quote from public records — a $30,000 range, and we assume the worst."
              : "Every room you show shrinks the guesswork — the range narrows and the number climbs."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          disabled={atLimit || isUploading}
          className="mt-6 flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-custom-yellow bg-yellow-50 p-6 text-center transition-colors hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-custom-yellow text-slate-900">
            <PlusIcon className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {atLimit
              ? "Photo limit reached"
              : isUploading
                ? "Uploading photos..."
                : "Tap to add photos"}
          </span>
          <span className="text-xs text-slate-500">
            {atLimit
              ? "Delete a photo to add another"
              : photos.length === 0
                ? "Pick a room, then choose photos from your device"
                : `${photos.length} added — tap to add more`}
          </span>
        </button>

        {pendingPhotos.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Processing photos
            </h2>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {pendingPhotos.map((photo) => (
                <li
                  key={photo.id}
                  className="overflow-hidden rounded-2xl bg-gray-100"
                >
                  <ImageLoader
                    src={photo.url}
                    alt={photo.name}
                    processing
                    processingLabel="Uploading..."
                    className="aspect-square w-full object-cover"
                  />
                  <p className="truncate px-2 py-2 text-xs text-slate-600">
                    {photo.category}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Uploading and optimizing your photos. You can continue when this
              finishes.
            </p>
          </section>
        )}

        {usedCategories.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Sorted into rooms for you
            </h2>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {usedCategories.map((category) => (
                <li key={category}>
                  <CategoryTile
                    category={category}
                    photos={photosIn(category)}
                    onClick={() => setViewingCategory(category)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 rounded-2xl bg-yellow-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-900">
              Property Photo Coverage
            </p>
            <span className="text-base font-bold text-slate-900">
              {coveragePct}%
            </span>
          </div>

          <ProgressBar percent={coveragePct} className="mt-3" />

          <p className="mt-3 text-xs text-slate-600">
            {remaining > 0
              ? `Add ${remaining} more photo${remaining === 1 ? "" : "s"} to improve your property condition estimate.`
              : "You've covered the whole place — that's plenty for a solid estimate."}
          </p>
        </div>

        <a
          href={DIRECT_PHOTOS_MAILTO}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-4 rounded-3xl border-2 border-slate-900 p-4 transition-colors hover:bg-custom-yellow active:bg-custom-yellow"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-custom-yellow">
            <ArrowUpIcon className="h-5 w-5 text-slate-900" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Got more than 10? Send them to us directly
            </p>
            <p className="mt-1 text-xs text-slate-600">
              The first 10 go to the AI grader. Extras help our team confirm
              condition.
            </p>
          </div>
        </a>

        <button
          type="button"
          onClick={() => {
            if (canContinue) navigate(`/addresses/${addressId}/timeline`);
          }}
          disabled={!canContinue}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-[#E8F4FD] disabled:opacity-50"
        >
          Continue
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          {canContinue
            ? "Roof and bathrooms move it most"
            : `Add at least ${MINIMUM_PHOTOS} photos to continue`}
        </p>
      </div>

      <AddPhotosDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        categories={categories}
        // onAddCategory={handleAddCategory}
        onAdd={handleAddPhotos}
        existingPhotos={photos}
        remainingSlots={remaining}
      />

      <CategoryPhotosDialog
        category={viewingCategory}
        photos={viewingCategory ? photosIn(viewingCategory) : []}
        onClose={() => setViewingCategory(null)}
        onDelete={handleDeletePhoto}
      />
    </StepsWrapper>
  );
};
