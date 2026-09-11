import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddPhotosDialog } from "../components/AddPhotosDialog";
import { CategoryPhotosDialog } from "../components/CategoryPhotosDialog";
import { CategoryTile } from "../components/CategoryTile";
import { ArrowUpIcon, PlusIcon } from "../components/icons";
import { ProgressBar } from "../components/ProgressBar";
import { StepHeader } from "../components/StepHeader";
import { useValuation } from "../context/ValuationContext";
import { dedupeFiles } from "../utils/photoFiles";
import type { UploadedPhoto } from "../types/photo";

const TARGET_PHOTOS = 10;

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

export const PropertyPhotosPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { property, photos, setPhotos } = useValuation();

  const [categories] = useState<string[]>(PHOTO_CATEGORIES); // setter unused while custom categories are off
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<string | null>(null);

  const progress = Math.min(photos.length / TARGET_PHOTOS, 1);
  const coveragePct = Math.round(progress * 100);
  const remaining = Math.max(TARGET_PHOTOS - photos.length, 0);
  const canContinue = photos.length > 0;
  const atLimit = photos.length >= TARGET_PHOTOS;

  const photosIn = (category: string) =>
    photos.filter((photo) => photo.category === category);

  // MVP: category list is fixed at PHOTO_CATEGORIES, so this (and the
  // setter above) is unused for now. Re-enable together with the "Other"
  // chip in AddPhotosDialog.
  // const handleAddCategory = (name: string) => {
  //   setCategories((prev) => [...prev, name]);
  // };

  const handleAddPhotos = (files: File[], category: string) => {
    const room = Math.max(TARGET_PHOTOS - photos.length, 0);
    const accepted = dedupeFiles(files, photos).slice(0, room);

    const additions: UploadedPhoto[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      category,
    }));

    const next = [...photos, ...additions];
    setPhotos(next);
  };

  const handleDeletePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.url);

    const next = photos.filter((photo) => photo.id !== id);
    setPhotos(next);

    if (viewingCategory && !next.some((p) => p.category === viewingCategory)) {
      setViewingCategory(null);
    }
  };

  const usedCategories = categories.filter((category) =>
    photos.some((photo) => photo.category === category),
  );

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <StepHeader current={2} total={4} label="Step 2 of 4 · Photos" />

      <main className="mt-8">
        <h1 className="font-serif text-3xl leading-[1.15]">
          Add 10 photos of your property
        </h1>

        <p className="mt-3 text-xs text-slate-600">
          {property
            ? `${property.title} · ${property.subtitle}`
            : `Property #${addressId}`}{" "}
          — the first 10 photos are what our AI grades, so cover the whole
          place.
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
          <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-800">
            <span>Every photo tightens the offer</span>
            <span className="text-slate-500">
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
          disabled={atLimit}
          className="mt-6 flex w-full flex-col items-center gap-3 rounded-2xl bg-gray-50 p-6 text-center transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-custom-yellow text-slate-900">
            <PlusIcon className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {atLimit ? "Photo limit reached" : "Tap to add photos"}
          </span>
          <span className="text-xs text-slate-500">
            {atLimit
              ? "Delete a photo to add another"
              : photos.length === 0
                ? "Pick a room, then choose photos from your device"
                : `${photos.length} added — tap to add more`}
          </span>
        </button>

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
        <div className="mt-6 flex items-center justify-center gap-4 rounded-3xl border-2 border-slate-900 p-4 transition-colors hover:bg-custom-yellow">
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
        </div>
      </main>

      <footer className="sticky bottom-0 -mx-5 mt-auto -mb-5 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {canContinue
              ? "Roof and bathrooms move it most"
              : "Add at least one photo to continue"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/contact`)}
          disabled={!canContinue}
          className="shrink-0 rounded-full bg-custom-yellow px-6 py-3 font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </footer>

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
    </div>
  );
};
