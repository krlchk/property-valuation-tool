export const getBlobContentHash = async (blob: Blob): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const getFileContentHash = (file: File): Promise<string> =>
  getBlobContentHash(file);
