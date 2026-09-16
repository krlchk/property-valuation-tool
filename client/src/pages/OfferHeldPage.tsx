import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../components/icons";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";
import { useOfferData } from "../hooks/useOfferData";
import { useRequireStep } from "../hooks/useRequireStep";
import {
  formatCurrency,
} from "../utils/estimate";
import {
  formatOfferTermsSummary,
  getOfferPriceRange,
} from "../utils/offerTerms";
import { useEffect, useState } from "react";
import { propertyService } from "../services/property.service";
import { LoadingSpinner } from "../components/Loading";
import { ErrorState } from "../components/Error";

const WHAT_HAPPENS_NEXT = [
  {
    title: "We call you",
    description: "Within one business day. A person, not a robot.",
  },
  {
    title: "We confirm the number",
    description:
      "Title check and a quick walk. The photos already did most of it.",
  },
  {
    title: "You close and get paid",
    description: "Wire or check, your choice of date. No fees come out of it.",
  },
];

export const OfferHeldPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const {
    photos,
    reset,
    conditionAdjustmentPct,
    estimatedPrice: contextEstimatedPrice,
    setEstimatedPrice: setContextEstimatedPrice,
  } = useValuation();
  const {
    property,
    selectedTerm,
    isLoading: isOfferLoading,
    error: offerError,
  } = useOfferData(addressId);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(
    contextEstimatedPrice,
  );
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useRequireStep("offer");

  useEffect(() => {
    let isMounted = true;

    const fetchEstimatedPrice = async () => {
      if (!property?.id) return;

      if (contextEstimatedPrice !== null) {
        setEstimatedPrice(contextEstimatedPrice);
        return;
      }

      try {
        setIsEstimating(true);
        const { estimatedPrice: totalPrice } = await propertyService.estimatePrice({
          propId: property.id,
          conditionAdjustmentPct: conditionAdjustmentPct ?? 0,
        });
        if (isMounted) {
          setEstimatedPrice(totalPrice);
          setContextEstimatedPrice(totalPrice);
        }
      } catch (err) {
        console.error("Failed to estimate price:", err);
        if (isMounted) {
          setFetchError("Failed to estimate property value.");
        }
      } finally {
        if (isMounted) {
          setIsEstimating(false);
        }
      }
    };

    fetchEstimatedPrice();

    return () => {
      isMounted = false;
    };
  }, [conditionAdjustmentPct, contextEstimatedPrice, property?.id, setContextEstimatedPrice]);

  const isLoading = isOfferLoading || isEstimating || estimatedPrice === null;

  if (isLoading) {
    return (
      <StepsWrapper
        stepHeaderCurrent={4}
        stepHeaderTotal={4}
        stepHeaderLabel="Offer held"
      >
        <LoadingSpinner label="Loading your offer details..." />
      </StepsWrapper>
    );
  }

  const errorMessage = fetchError || offerError;

  if (errorMessage || !property) {
    return (
      <StepsWrapper
        stepHeaderCurrent={4}
        stepHeaderTotal={4}
        stepHeaderLabel="Offer held"
      >
        <ErrorState
          message={errorMessage || "Unable to locate property records."}
          actionLabel="Start Over"
          onAction={() => navigate("/")}
        />
      </StepsWrapper>
    );
  }

  const { low, high } = getOfferPriceRange(
    1,
    estimatedPrice,
  );

  const locationLabel = `${property.addressLine1}, ${property.city}`;
  const referenceId = property.id;
  const termsSummaryText = selectedTerm
    ? formatOfferTermsSummary(selectedTerm)
    : "Standard Terms";

  return (
    <StepsWrapper
      stepHeaderCurrent={4}
      stepHeaderTotal={4}
      stepHeaderLabel="Offer held"
      stepHeaderOnBack={() => navigate(`/addresses/${addressId}/offer`)}
    >
      <div className="mt-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-custom-yellow">
          <CheckIcon className="h-6 w-6 text-slate-900" />
        </span>
        <h1 className="mt-4 font-serif text-hero leading-[1.15]">
          Your offer is held.
        </h1>
        <p className="mt-3 text-body-sm text-slate-600">
          {locationLabel}. Nothing is signed yet — this simply confirms your
          offer for your records.
        </p>

        <div className="mt-6 rounded-2xl bg-blue-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm text-slate-700">
              <p>
                {photos.length} photo{photos.length === 1 ? "" : "s"}
              </p>
              <p>{termsSummaryText}</p>
            </div>
            <p className="text-right text-xl font-bold text-slate-900">
              {formatCurrency(low)}–{high.toLocaleString("en-US")}
            </p>
          </div>

          <div className="my-4 border-t border-custom-blue/15" />

          <p className="text-sm text-slate-700">Reference №{referenceId}. Call or text (817) 555–0100, 8am to 7pm — a person answers.</p>
        </div>

        <ul className="mt-4 space-y-3">
          {WHAT_HAPPENS_NEXT.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-2xl bg-gray-50 p-4"
            >
              <span className="text-sm font-bold text-custom-blue">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            reset();
            navigate("/");
          }}
          className="mt-8 w-full cursor-pointer p-1 text-center text-sm text-gray-500"
        >
          Estimate another property
        </button>
      </div>
    </StepsWrapper>
  );
};
