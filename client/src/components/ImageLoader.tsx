import { useState, type ImgHTMLAttributes } from "react";

type ImageLoaderProps = ImgHTMLAttributes<HTMLImageElement> & {
  containerClassName?: string;
  processing?: boolean;
  processingLabel?: string;
};

export const ImageLoader = ({
  containerClassName = "relative",
  className = "",
  processing = false,
  processingLabel = "Processing...",
  onLoad,
  onError,
  src,
  ...imageProps
}: ImageLoaderProps) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = src ?? "";
  const status =
    failedSrc === currentSrc
      ? "error"
      : loadedSrc === currentSrc
        ? "loaded"
        : "loading";

  const isLoading = status === "loading";

  return (
    <div className={containerClassName}>
      <img
        {...imageProps}
        src={src}
        className={`${className} ${status === "error" ? "opacity-0" : ""}`}
        onLoad={(event) => {
          setLoadedSrc(currentSrc);
          setFailedSrc(null);
          onLoad?.(event);
        }}
        onError={(event) => {
          setFailedSrc(currentSrc);
          onError?.(event);
        }}
      />

      {(isLoading || processing) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/45 text-center text-xs font-medium text-white">
          <span
            className="h-7 w-7 animate-spin rounded-full border-4 border-white/40 border-t-custom-yellow"
            aria-hidden="true"
          />
          {processing && <span>{processingLabel}</span>}
        </div>
      )}

      {status === "error" && !processing && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-2 text-center text-xs text-slate-500">
          Image unavailable
        </div>
      )}
    </div>
  );
};
