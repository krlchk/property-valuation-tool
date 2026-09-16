import sharp from "sharp";
import convert from "heic-convert";

export const processToWebp = async (inputBuffer: Buffer): Promise<Buffer> => {
  try {
    return await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch (err: any) {
    // Catch Sharp/libheif decoding failures (e.g. "source: bad seek" or "heif: Decoder plugin")
    const isHeifError =
      err?.message?.includes("heif") || err?.message?.includes("bad seek");

    if (!isHeifError) throw err;

    // Fallback: Convert HEIC/HEIF payload to JPEG via heic-convert, then re-process with Sharp
    const convertedJpeg = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.9,
    });

    return await sharp(Buffer.from(convertedJpeg), { failOn: "none" })
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  }
}
