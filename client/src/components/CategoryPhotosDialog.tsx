import { useState } from "react";
import { Modal } from "./Modal";
import { XIcon } from "./icons";
import { ImageLoader } from "./ImageLoader";
import type { UploadedPhoto } from "../types/photo";

type CategoryPhotosDialogProps = {
  category: string | null;
  photos: UploadedPhoto[];
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
};

export const CategoryPhotosDialog = ({
  category,
  photos,
  onClose,
  onDelete,
}: CategoryPhotosDialogProps) => {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setRemovingId(id);
    try {
      await onDelete(id);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClose = () => {
    if (!removingId) onClose();
  };

  return <Modal
    open={category !== null}
    onClose={handleClose}
    title={
      <>
        {category}{" "}
        <span className="font-normal text-slate-500">({photos.length})</span>
      </>
    }
  >
    <ul className="grid grid-cols-2 gap-2">
      {photos.map((photo) => (
        <li key={photo.id} className="relative">
          <ImageLoader
            src={photo.url}
            alt={photo.name}
            className="aspect-square w-full rounded-xl object-cover"
          />
          {removingId === photo.id && (
            <div
              className="absolute inset-0 flex animate-pulse items-center justify-center rounded-xl bg-white/45"
              aria-label={`Removing ${photo.name}`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-white/75 shadow-[0_0_24px_8px_rgba(255,255,255,0.75)]" />
                <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  Removing photo
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => void handleDelete(photo.id)}
            disabled={removingId !== null}
            aria-label={`Delete ${photo.name}`}
            className="absolute top-1.5 right-1.5 rounded-full bg-black/55 p-1 text-white transition-colors hover:bg-black/75"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  </Modal>;
};
