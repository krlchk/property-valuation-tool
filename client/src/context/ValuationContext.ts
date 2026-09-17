import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
// import type { TimelineOption } from "../types/timeline";
import type { OfferTerm, PropertyResponse } from "@pvt/shared";

export type ValuationContextType = {
  property: PropertyResponse | null;
  setProperty: (property: PropertyResponse) => void;
  selectedTerm: OfferTerm | null;
  setSelectedTerm: (term: OfferTerm | null) => void;
  conditionAdjustmentPct: number | null;
  setConditionAdjustmentPct: (value: number | null) => void;
  estimatedPrice: number | null;
  setEstimatedPrice: (value: number | null) => void;
  photos: UploadedPhoto[];
  setPhotos: (photos: UploadedPhoto[]) => void;
  hydratedPropertyId: string | null;
  setHydratedPropertyId: (propertyId: string | null) => void;
  // timeline: TimelineOption | null;
  // setTimeline: (timeline: TimelineOption) => void;
  contact: ContactInfo;
  setContact: Dispatch<SetStateAction<ContactInfo>>;

  fetchPropertyById: (id: string) => Promise<void>;
  fetchTermById: (id: number) => Promise<void>;

  isLoading: boolean;
  error: string | null;

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
