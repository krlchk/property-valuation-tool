import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ValuationContext } from "./ValuationContext";
import { EMPTY_CONTACT, type ContactInfo } from "../types/contact";
import type { UploadedPhoto } from "../types/photo";
import type { OfferTerm, PropertyResponse } from "@pvt/shared";
import { propertyService } from "../services/property.service";
import { offerTermsService } from "../services/offer-terms.service";
import { aiReviewService } from "../services/ai-review.service";

export const ValuationProvider = ({ children }: { children: ReactNode }) => {
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [hydratedPropertyId, setHydratedPropertyId] = useState<string | null>(
    null,
  );
  const [selectedTerm, setSelectedTerm] = useState<OfferTerm | null>(null);
  const [conditionAdjustmentPct, setConditionAdjustmentPct] = useState<
    number | null
  >(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [aiReviewId, setAiReviewId] = useState<number | null>(null);
  const [aiReviewPhotoSignature, setAiReviewPhotoSignature] = useState<
    string | null
  >(null);
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!property?.id) return;

    let isMounted = true;

    aiReviewService
      .getPropertyReview(property.id)
      .then((review) => {
        if (!isMounted) return;

        setAiReviewId(review?.id ?? null);
        setConditionAdjustmentPct(review?.conditionAdjustmentPct ?? null);
      })
      .catch((reviewError: unknown) => {
        if (!isMounted) return;

        console.error("Failed to fetch property AI review:", reviewError);
        setAiReviewId(null);
        setConditionAdjustmentPct(null);
      });

    return () => {
      isMounted = false;
    };
  }, [property?.id]);

  const updatePhotos = useCallback((nextPhotos: UploadedPhoto[]) => {
    setPhotos((previousPhotos) => {
      const previousSignature = previousPhotos
        .map((photo) => `${photo.id}:${photo.contentHash ?? ""}`)
        .sort()
        .join("|");
      const nextSignature = nextPhotos
        .map((photo) => `${photo.id}:${photo.contentHash ?? ""}`)
        .sort()
        .join("|");

      if (previousSignature !== nextSignature) {
        setAiReviewId(null);
        setAiReviewPhotoSignature(null);
        setConditionAdjustmentPct(null);
        setEstimatedPrice(null);
      }

      return nextPhotos;
    });
  }, []);

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
    setAiReviewId(null);
    setAiReviewPhotoSignature(null);
    setHydratedPropertyId(null);
    setSelectedTerm(null);
    setConditionAdjustmentPct(null);
    setEstimatedPrice(null);
    setContact(EMPTY_CONTACT);
  };

  return (
    <ValuationContext.Provider
      value={{
        property,
        setProperty,
        photos,
        setPhotos: updatePhotos,
        hydratedPropertyId,
        setHydratedPropertyId,
        selectedTerm,
        setSelectedTerm,
        conditionAdjustmentPct,
        setConditionAdjustmentPct,
        estimatedPrice,
        setEstimatedPrice,
        aiReviewId,
        setAiReviewId,
        aiReviewPhotoSignature,
        setAiReviewPhotoSignature,
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
