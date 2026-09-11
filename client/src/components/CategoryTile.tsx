import type { UploadedPhoto } from "../types/photo";

type CategoryTileProps = {
  category: string;
  photos: UploadedPhoto[];
  onClick: () => void;
};

export const CategoryTile = ({
  category,
  photos,
  onClick,
}: CategoryTileProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${category}, ${photos.length} photo${
      photos.length === 1 ? "" : "s"
    }`}
    className="relative block w-full overflow-hidden rounded-2xl bg-gray-100"
  >
    <img
      src={photos[0].url}
      alt=""
      className="aspect-square w-full object-cover"
    />
    {photos.length >= 2 && (
      <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/25 font-bold text-white">
        <span className="text-xl leading-none">{photos.length}</span>
        <span className="mt-0.5 text-xs font-medium">photos</span>
      </span>
    )}
    <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-800">
      {category}
    </span>
  </button>
);
