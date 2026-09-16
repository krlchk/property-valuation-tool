import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/Loading";
import { ErrorState } from "../components/Error";
import { useValuation } from "../context/ValuationContext";
import { offerTermsService } from "../services/offer-terms.service";
import { propertyPhotosService } from "../services/property-photos.service";
import { propertyService } from "../services/property.service";

export const PropertyFlowLayout = () => {
  const { addressId } = useParams<{ addressId: string }>();
  const {
    hydratedPropertyId,
    setHydratedPropertyId,
    setProperty,
    setPhotos,
    setSelectedTerm,
  } = useValuation();
  const [errorAddressId, setErrorAddressId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!addressId || hydratedPropertyId === addressId) return;

    const controller = new AbortController();

    const hydrate = async () => {
      try {
        const [property, photos] = await Promise.all([
          propertyService.getById(addressId),
          propertyPhotosService.getByPropertyId(addressId, controller.signal),
        ]);

        let selectedTerm = null;
        if (property.offerTermsId) {
          selectedTerm = await offerTermsService.getById(property.offerTermsId);
        }

        if (controller.signal.aborted) return;

        setProperty(property);
        setPhotos(photos);
        setSelectedTerm(selectedTerm);
        setLoadError(null);
        setErrorAddressId(null);
        setHydratedPropertyId(addressId);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        console.error("Failed to load property flow:", error);
        setLoadError("Failed to load this property's details. Please try again.");
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
  ]);

  if (!addressId) {
    return <p className="p-8 text-center text-sm text-red-700">Missing property ID.</p>;
  }

  const isLoading = hydratedPropertyId !== addressId;
  const error = errorAddressId === addressId ? loadError : null;

  if (isLoading && !error) {
    return <LoadingSpinner label="Loading property details..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return <Outlet />;
};
