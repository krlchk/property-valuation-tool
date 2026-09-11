import { useState, type ReactNode } from "react";
import { ValuationContext, type PropertyData } from "./ValuationContext";
import type { UploadedPhoto } from "../types/photo";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  return (
    <ValuationContext.Provider
      value={{ property, setProperty, photos, setPhotos }}
    >
      {children}
    </ValuationContext.Provider>
  );
};
