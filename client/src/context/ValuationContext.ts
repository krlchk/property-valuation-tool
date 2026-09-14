import { createContext, useContext } from "react";
import type { Address } from "../types/address";
import type { ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
import type { TimelineOption } from "../types/timeline";

export type PropertyData = Address;

export type ValuationContextType = {
  property: PropertyData | null;
  setProperty: (property: PropertyData) => void;
  /** Uploaded photos — lives here (not on PropertyPhotosPage) so they
   * survive navigating away and back, e.g. via the offer page's
   * "Add photos" link. */
  photos: UploadedPhoto[];
  setPhotos: (photos: UploadedPhoto[]) => void;
  /** Timeline picked on TimelinePage — read by OfferPage to price and
   * describe the offer. */
  timeline: TimelineOption | null;
  setTimeline: (timeline: TimelineOption) => void;
  /** ContactPage's form fields — lives here so they survive navigating away
   * and back (e.g. OfferPage's Back / "Change my timeline" round-trip
   * through TimelinePage and back to ContactPage). */
  contact: ContactInfo;
  setContact: (contact: ContactInfo) => void;
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
