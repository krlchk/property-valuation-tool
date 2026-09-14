import { useState, type ReactNode } from "react";
import { ValuationContext } from "./ValuationContext";
import { EMPTY_CONTACT, type ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
import type { TimelineOption } from "../types/timeline";
import type { PropertyResponse } from "@pvt/shared";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [timeline, setTimeline] = useState<TimelineOption | null>(null);
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);

  const reset = () => {
    setProperty(null);
    setPhotos([]);
    setTimeline(null);
    setContact(EMPTY_CONTACT);
  };

  return (
    <ValuationContext.Provider
      value={{
        property,
        setProperty,
        photos,
        setPhotos,
        timeline,
        setTimeline,
        contact,
        setContact,
        reset,
      }}
    >
      {children}
    </ValuationContext.Provider>
  );
};
