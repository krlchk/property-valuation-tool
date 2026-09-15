import { useCallback, useState, type ReactNode } from "react";
import { ValuationContext } from "./ValuationContext";
import { EMPTY_CONTACT, type ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
import type { OfferTerm, PropertyResponse } from "@pvt/shared";
import { propertyService } from "../services/property.service";
import { offerTermsService } from "../services/offer-terms.service";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<OfferTerm | null>(null);
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPropertyById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await propertyService.getById(id);
      setProperty(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch property");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTermById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const term = await offerTermsService.getById(id);
      setSelectedTerm(term);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch term");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = () => {
    setProperty(null);
    setPhotos([]);
    setSelectedTerm(null);
    setContact(EMPTY_CONTACT);
  };

  return (
    <ValuationContext.Provider
      value={{
        property,
        setProperty,
        photos,
        setPhotos,
        selectedTerm,
        setSelectedTerm,
        contact,
        setContact,
        fetchPropertyById,
        fetchTermById,
        isLoading,
        error,
        reset,
      }}
    >
      {children}
    </ValuationContext.Provider>
  );
};
