export const getBlobContentHash = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  // Web Crypto is unavailable in some mobile browsers when the app is served
  // over plain HTTP (for example, from a local network IP). Keep photo
  // selection and duplicate detection working in that environment too.
  if (globalThis.crypto?.subtle) {
    try {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      // Fall through to the portable hash below.
    }
  }

  // FNV-1a is not used for security; it is only a portable content
  // fingerprint for client-side duplicate detection.
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
};

export const getFileContentHash = async (file: File): Promise<string> => {
  try {
    return await getBlobContentHash(file);
  } catch {
    // Some mobile browsers cannot read photos that are still in cloud storage
    // or were returned by a protected document provider. Do not block the
    // upload just because duplicate hashing is unavailable.
    return `metadata-${file.name}-${file.size}-${file.lastModified}`;
  }
};
