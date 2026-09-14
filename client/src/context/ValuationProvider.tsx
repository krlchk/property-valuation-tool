import { useState, type ReactNode } from "react";
import { ValuationContext, type PropertyData } from "./ValuationContext";
import { EMPTY_CONTACT, type ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
import type { TimelineOption } from "../types/timeline";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [timeline, setTimeline] = useState<TimelineOption | null>(null);
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);

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
      }}
    >
      {children}
    </ValuationContext.Provider>
  );
};
