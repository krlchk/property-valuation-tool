import type { UploadedPhoto } from "../types/photo";

type FileLike = Pick<File, "name" | "size" | "lastModified">;

const fingerprint = (file: FileLike) =>
  `${file.name}::${file.size}::${file.lastModified}`;

export const dedupeFiles = (
  files: File[],
  existing: UploadedPhoto[],
): File[] => {
  const seen = new Set(existing.map(fingerprint));
  const unique: File[] = [];

  for (const file of files) {
    const key = fingerprint(file);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(file);
  }

  return unique;
};
