import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";
import { ErrorState } from "../components/Error";
import { useValuation } from "../context/ValuationContext";
import { offerTermsService } from "../services/offer-terms.service";
import { propertyPhotosService } from "../services/property-photos.service";
import { propertyService } from "../services/property.service";
import { aiReviewService } from "../services/ai-review.service";
import { StepsWrapper } from "../components/StepsWrapper";

export const PropertyFlowLayout = () => {
  const location = useLocation();
  const { addressId } = useParams<{ addressId: string }>();
  const {
    hydratedPropertyId,
    setHydratedPropertyId,
    setProperty,
    setPhotos,
    setSelectedTerm,
    setAiReviewId,
    setConditionAdjustmentPct,
  } = useValuation();
  const [errorAddressId, setErrorAddressId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!addressId || hydratedPropertyId === addressId) return;

    const controller = new AbortController();

    const hydrate = async () => {
      try {
        const [property, photos, review] = await Promise.all([
          propertyService.getById(addressId),
          propertyPhotosService.getByPropertyId(addressId, controller.signal),
          aiReviewService.getPropertyReview(addressId),
        ]);

        let selectedTerm = null;
        if (property.offerTermsId) {
          selectedTerm = await offerTermsService.getById(property.offerTermsId);
        }

        if (controller.signal.aborted) return;

        setProperty(property);
        setPhotos(photos);
        setAiReviewId(review?.id ?? null);
        setConditionAdjustmentPct(review?.conditionAdjustmentPct ?? null);
        setSelectedTerm(selectedTerm);
        setLoadError(null);
        setErrorAddressId(null);
        setHydratedPropertyId(addressId);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Failed to load property flow:", error);
        setLoadError(
          "Failed to load this property's details. Please try again.",
        );
        setErrorAddressId(addressId);
      }
    };

    void hydrate();

    return () => controller.abort();
  }, [
    addressId,
    hydratedPropertyId,
    setHydratedPropertyId,
    setPhotos,
    setProperty,
    setSelectedTerm,
    setAiReviewId,
    setConditionAdjustmentPct,
  ]);

  if (!addressId) {
    return (
      <p className="p-8 text-center text-sm text-red-700">
        Missing property ID.
      </p>
    );
  }

  const isLoading = hydratedPropertyId !== addressId;
  const error = errorAddressId === addressId ? loadError : null;
  const isPhotosPage = location.pathname.endsWith("/photos");
  const loadingStep = location.pathname.endsWith("/timeline")
    ? { stepHeaderCurrent: 3, stepHeaderLabel: "Step 3 of 4 · Timeline" }
    : location.pathname.endsWith("/contact")
      ? { stepHeaderCurrent: 4, stepHeaderLabel: "Step 4 of 4 · Contact" }
      : location.pathname.includes("/offer")
        ? { stepHeaderCurrent: 4, stepHeaderLabel: "Your offer" }
        : { stepHeaderCurrent: 1, stepHeaderLabel: "Step 1 of 4 · Address" };

  if (isLoading && !error && !isPhotosPage) {
    return (
      <StepsWrapper
        stepHeaderCurrent={loadingStep.stepHeaderCurrent}
        stepHeaderTotal={4}
        stepHeaderLabel={loadingStep.stepHeaderLabel}
      >
        <LoadingSpinner label="Loading property details..." />
      </StepsWrapper>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return <Outlet />;
};
