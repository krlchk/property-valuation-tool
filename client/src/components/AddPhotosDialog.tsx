import { useState, type ChangeEvent } from "react";
import { Modal } from "./Modal";
import { PlusIcon } from "./icons";
import { dedupeFiles } from "../utils/photoFiles";
import type { UploadedPhoto } from "../types/photo";

type AddPhotosDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: string[];
  // onAddCategory: (name: string) => void; // MVP: fixed category list, see PropertyPhotosPage.
  onAdd: (files: File[], category: string) => void;
  existingPhotos: UploadedPhoto[];
  remainingSlots: number;
};

export const AddPhotosDialog = ({
  open,
  onClose,
  categories,
  // onAddCategory,
  onAdd,
  existingPhotos,
  remainingSlots,
}: AddPhotosDialogProps) => {
  const [category, setCategory] = useState(categories[0] ?? "");
  const [files, setFiles] = useState<File[]>([]);
  // const [customDraft, setCustomDraft] = useState("");
  // const [showCustom, setShowCustom] = useState(false);

  const resetAndClose = () => {
    setFiles([]);
    // setCustomDraft("");
    // setShowCustom(false);
    onClose();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files ? Array.from(event.target.files) : [];
    const unique = dedupeFiles(picked, existingPhotos);
    setFiles(unique.slice(0, remainingSlots));
  };

  // MVP: category list is fixed (see PHOTO_CATEGORIES in PropertyPhotosPage).
  // Re-enable by uncommenting this, the "Other" chip below, the input row,
  // and `onAddCategory` in the props.
  // const handleAddCustom = () => {
  //   const name = customDraft.trim();
  //   if (!name) return;
  //   if (!categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
  //     onAddCategory(name);
  //   }
  //   setCategory(name);
  //   setCustomDraft("");
  //   setShowCustom(false);
  // };

  const handleSubmit = () => {
    if (files.length === 0 || !category) return;
    onAdd(files, category);
    resetAndClose();
  };

  return (
    <Modal open={open} onClose={resetAndClose} title="Add photos">
      <p className="text-xs font-medium text-slate-700">Category</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {categories.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCategory(option)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              category === option
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-slate-700 hover:bg-blue-200"
            }`}
          >
            {option}
          </button>
        ))}
        {/* MVP: fixed category list, no custom categories for now.
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-gray-200"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Other
        </button>
        */}
      </div>

      {/*
      {showCustom && (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={customDraft}
            onChange={(event) => setCustomDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder="New category, e.g. Basement"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white"
          >
            Add
          </button>
        </div>
      )}
      */}

      <p className="mt-4 text-xs font-medium text-slate-700">
        Photos{" "}
        {remainingSlots > 0 && (
          <span className="font-normal text-slate-400">
            (up to {remainingSlots} more)
          </span>
        )}
      </p>
      {remainingSlots > 0 ? (
        <label className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 p-6 text-center transition-colors hover:bg-gray-50">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400">
            <PlusIcon className="h-5 w-5" />
          </span>
          <span className="text-xs text-slate-600">
            {files.length > 0
              ? `${files.length} photo${files.length > 1 ? "s" : ""} selected`
              : "Choose photos from your device"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="mt-2 rounded-2xl border border-dashed border-gray-300 p-6 text-center text-xs text-slate-500">
          You've reached the photo limit for this prototype. Delete a photo to
          add another.
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={resetAndClose}
          className="flex-1 rounded-full border border-gray-200 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={files.length === 0 || !category}
          className="flex-1 rounded-full bg-yellow-400 py-2.5 text-xs font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {files.length > 0
            ? `Add ${files.length} ${files.length === 1 ? "photo" : "photos"}`
            : "Add photos"}
        </button>
      </div>
    </Modal>
  );
};
