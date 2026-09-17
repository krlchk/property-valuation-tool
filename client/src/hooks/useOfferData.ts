import { useEffect } from "react";
import { useValuation } from "../context/ValuationContext";

export const useOfferData = (addressId?: string) => {
  const {
    property,
    selectedTerm,
    fetchPropertyById,
    fetchTermById,
    isLoading: isContextLoading,
    error: contextError,
  } = useValuation();
  const propertyId = property?.id;

  useEffect(() => {
    if (!addressId || propertyId === addressId) return;

    void fetchPropertyById(addressId);
  }, [addressId, propertyId, fetchPropertyById]);

  useEffect(() => {
    const offerTermsId = property?.offerTermsId;
    if (!offerTermsId || selectedTerm?.id === offerTermsId) return;

    void fetchTermById(offerTermsId);
  }, [property?.offerTermsId, selectedTerm?.id, fetchTermById]);

  const timelineAdjustmentPct = selectedTerm
    ? Math.round((selectedTerm.priceMultiplier - 1) * 100)
    : 0;
  const isTermLoading = Boolean(
    property?.offerTermsId && selectedTerm?.id !== property.offerTermsId,
  );

  return {
    property,
    selectedTerm,
    timelineAdjustmentPct,
    isLoading:
      isContextLoading || isTermLoading || (!property && !contextError),
    error: contextError,
  };
};
