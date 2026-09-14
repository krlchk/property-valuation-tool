import { createContext, useContext } from "react";
import type { Address } from "../types/address";
import type { ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
import type { TimelineOption } from "../types/timeline";

export type PropertyData = Address;

export type ValuationContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData) => void;
  photos: UploadedPhoto[];
  setPhotos: (photos: UploadedPhoto[]) => void;
  timeline: TimelineOption | null;
  setTimeline: (timeline: TimelineOption) => void;
  contact: ContactInfo;
  setContact: (contact: ContactInfo) => void;
  /** Clears property/photos/timeline/contact — used by "start over" actions
   * (burger menu, the final page's CTA) so a fresh run doesn't inherit
   * stale answers from the previous one. */
  reset: () => void;
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
