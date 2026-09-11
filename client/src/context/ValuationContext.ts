import { createContext, useContext } from "react";
import type { Address } from "../types/address";
import type { UploadedPhoto } from "../types/photo";

export type PropertyData = Address;

export type ValuationContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData) => void;
  /** Uploaded photos — lives here (not on PropertyPhotosPage) so they
   * survive navigating away and back, e.g. via the offer page's
   * "Add photos" link. */
  photos: UploadedPhoto[];
  setPhotos: (photos: UploadedPhoto[]) => void;
};

export const ValuationContext = createContext<ValuationContextType | undefined>(
  undefined,
);

export const useValuation = () => {
  const context = useContext(ValuationContext);

  if (!context) {
    throw new Error("useValuation must be used inside ValuationProvider");
  }

  return context;
};
