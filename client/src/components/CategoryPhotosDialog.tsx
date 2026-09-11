import { Modal } from "./Modal";
import { XIcon } from "./icons";
import type { UploadedPhoto } from "../types/photo";

type CategoryPhotosDialogProps = {
  category: string | null;
  photos: UploadedPhoto[];
  onClose: () => void;
  onDelete: (id: string) => void;
};

export const CategoryPhotosDialog = ({
  category,
  photos,
  onClose,
  onDelete,
}: CategoryPhotosDialogProps) => (
  <Modal
    open={category !== null}
    onClose={onClose}
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
          <img
            src={photo.url}
            alt={photo.name}
            className="aspect-square w-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={() => onDelete(photo.id)}
            aria-label={`Delete ${photo.name}`}
            className="absolute top-1.5 right-1.5 rounded-full bg-black/55 p-1 text-white transition-colors hover:bg-black/75"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  </Modal>
);
