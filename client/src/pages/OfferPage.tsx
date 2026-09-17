import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StepsWrapper } from "../components/StepsWrapper";
import { LoadingSpinner } from "../components/Loading";
import { ErrorState } from "../components/Error";
import { useOfferData } from "../hooks/useOfferData";
import { useRequireStep } from "../hooks/useRequireStep";
import { useValuation } from "../context/ValuationContext";
import { aiReviewService } from "../services/ai-review.service";
import { offersService } from "../services/offers.service";
import { propertyService } from "../services/property.service";
import type { OfferTerm } from "@pvt/shared";
import { STARTING_VALUE, formatCurrency } from "../utils/estimate";
import { getOfferPriceRange } from "../utils/offerTerms";

const OFFER_VALIDITY_DAYS = 14;

// The two detail boxes that don't change with the chosen timeline.
const FIXED_DETAILS = [
  { label: "Repairs", value: "None — on us" },
  { label: "Fees at closing", value: "$0" },
];

const getOfferContent = (term: OfferTerm) => {
  const timelineAdjustmentPct = Math.round((term.priceMultiplier - 1) * 100);

  if (timelineAdjustmentPct <= -15) {
    return {
      eyebrow: "Seven-day cash offer",
      subtitle: `Priced for a ${term.closingDaysMin}-day close. More photos tighten the range.`,
      note: "No inspection, no repairs, no fees. Name the closing day and we hit it.",
    };
  }

  if (timelineAdjustmentPct < 0) {
    return {
      eyebrow: "Thirty-day offer",
      subtitle: `Priced for a ${term.closingDaysMin}-day close. More photos tighten the range.`,
      note: `${term.inspectionDescription ?? `${term.inspectionDays}-day inspection`}, then we close. Repairs still on us.`,
    };
  }

  return {
    eyebrow: "Full-value offer",
    subtitle:
      "Priced at full value on a normal timeline. More photos tighten the range.",
    note: `${term.inspectionDescription ?? `${term.inspectionDays}-day due diligence`}, a normal close, and the top number we can write.`,
  };
};

export const OfferPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { property, selectedTerm, timelineAdjustmentPct, isLoading, error } =
    useOfferData(addressId);
  const {
    conditionAdjustmentPct,
    setConditionAdjustmentPct,
    estimatedPrice,
    setEstimatedPrice,
  } = useValuation();
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const assessmentKeyRef = useRef<string | null>(null);

  useRequireStep("offer");

  useEffect(() => {
    if (!property?.id || !selectedTerm) return;
    if (conditionAdjustmentPct !== null && estimatedPrice !== null) return;

    const assessmentKey = `${property.id}:${selectedTerm.id}`;
    if (assessmentKeyRef.current === assessmentKey) return;
    assessmentKeyRef.current = assessmentKey;

    let isMounted = true;

    const assessProperty = async () => {
      setIsAssessing(true);
      setAssessmentError(null);

      try {
        let adjustmentPct = conditionAdjustmentPct;

        if (adjustmentPct === null) {
          const review = await aiReviewService.reviewPropertyById(property.id);
          if (!isMounted) return;

          adjustmentPct = review.totalAdjustmentPct;
          setConditionAdjustmentPct(adjustmentPct);
        }

        if (estimatedPrice === null) {
          const estimate = await propertyService.estimatePrice({
            propId: property.id,
            conditionAdjustmentPct: adjustmentPct,
          });
          if (!isMounted) return;

          setEstimatedPrice(estimate.estimatedPrice);
        }
      } catch (requestError: unknown) {
        if (!isMounted) return;

        console.error("Failed to assess property:", requestError);
        setAssessmentError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to calculate your offer. Please try again.",
        );
      } finally {
        if (isMounted) setIsAssessing(false);
      }
    };

    void assessProperty();

    return () => {
      isMounted = false;
    };
  }, [
    conditionAdjustmentPct,
    estimatedPrice,
    property?.id,
    selectedTerm,
    setConditionAdjustmentPct,
    setEstimatedPrice,
  ]);

  if (error || assessmentError) {
    return (
      <StepsWrapper
        stepHeaderCurrent={4}
        stepHeaderTotal={4}
        stepHeaderLabel="Your offer"
      >
        <ErrorState
          message={
            error || assessmentError || "Unable to calculate your offer."
          }
          actionLabel="Start Over"
          onAction={() => navigate("/")}
        />
      </StepsWrapper>
    );
  }

  if (isLoading || isAssessing) {
    return (
      <StepsWrapper
        stepHeaderCurrent={4}
        stepHeaderTotal={4}
        stepHeaderLabel="Your offer"
      >
        <LoadingSpinner label="Loading your offer details..." />
      </StepsWrapper>
    );
  }

  if (
    !property ||
    !selectedTerm ||
    conditionAdjustmentPct === null ||
    estimatedPrice === null
  ) {
    return (
      <StepsWrapper
        stepHeaderCurrent={4}
        stepHeaderTotal={4}
        stepHeaderLabel="Your offer"
      >
        <ErrorState
          message={
            error || assessmentError || "Unable to locate offer details."
          }
          actionLabel="Start Over"
          onAction={() => navigate("/")}
        />
      </StepsWrapper>
    );
  }

  const startingValue = property?.startingValue ?? STARTING_VALUE;

  const conditionAdjustmentAmount = Math.round(
    startingValue * (conditionAdjustmentPct / 100),
  );

  const estimatedValue = startingValue + conditionAdjustmentAmount;

  const content = getOfferContent(selectedTerm);

  const { low, high } = getOfferPriceRange(1, estimatedPrice);

  const timelineAdjustmentAmount = Math.round(
    estimatedValue * (selectedTerm.priceMultiplier - 1),
  );

  const handleAcceptOffer = async () => {
    if (isAccepting) return;

    if (!property.userId) {
      setAcceptError(
        "We couldn't find your contact details. Please try again.",
      );
      return;
    }

    setIsAccepting(true);
    setAcceptError(null);

    try {
      await offersService.create({
        propertyId: property.id,
        userId: property.userId,
        minPrice: low,
        maxPrice: high,
        status: "accepted",
      });
      navigate(`/addresses/${addressId}/offer/held`);
    } catch (requestError: unknown) {
      console.error("Failed to accept offer:", requestError);
      setAcceptError(
        requestError instanceof Error
          ? requestError.message
          : "We couldn't accept your offer. Please try again.",
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const detailBoxes = [
    {
      label: "Closing date",
      value: selectedTerm.closingDaysMax
        ? `${selectedTerm.closingDaysMin}–${selectedTerm.closingDaysMax} days`
        : `${selectedTerm.closingDaysMin} days`,
    },
    {
      label: "Inspection",
      value:
        selectedTerm.inspectionDescription ??
        `${selectedTerm.inspectionDays}-day window`,
    },
    ...FIXED_DETAILS,
  ];

  return (
    <StepsWrapper
      stepHeaderCurrent={4}
      stepHeaderTotal={4}
      stepHeaderLabel={`Your offer · Valid ${OFFER_VALIDITY_DAYS} days`}
      stepHeaderOnBack={() => navigate(`/addresses/${addressId}/timeline`)}
    >
      <div className="mt-5">
        {acceptError && (
          <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            {acceptError}
          </p>
        )}

        <h1 className="font-serif text-hero leading-[1.15]">
          Here's your offer.
        </h1>
        <p className="mt-3 text-body-sm text-slate-600">{content.subtitle}</p>

        <div className="mt-6 rounded-2xl bg-yellow-100 p-5">
          <p className="text-xs font-bold tracking-wider text-[#7A5C00] uppercase">
            {content.eyebrow}
          </p>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-900">Starting value:</span>
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(startingValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-900">
                Condition adjustment:
              </span>
              <span
                className={`text-base font-bold ${
                  conditionAdjustmentPct < 0
                    ? "text-rose-800"
                    : "text-emerald-800"
                }`}
              >
                {conditionAdjustmentPct > 0 ? "+" : ""}
                {conditionAdjustmentPct}% (
                {conditionAdjustmentAmount > 0 ? "+" : ""}
                {formatCurrency(conditionAdjustmentAmount)})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-900">
                Timeline adjustment:
              </span>
              <span
                className={`text-base font-bold ${
                  timelineAdjustmentPct < 0
                    ? "text-rose-800"
                    : "text-emerald-800"
                }`}
              >
                {timelineAdjustmentPct > 0 ? "+" : ""}
                {timelineAdjustmentPct}% (
                {timelineAdjustmentAmount > 0 ? "+" : ""}
                {formatCurrency(timelineAdjustmentAmount)})
              </span>
            </div>
          </div>

          <div className="my-4 border-t border-[#7A5C00]/20" />

          <div>
            <p className="text-xs font-bold tracking-wider text-[#7A5C00] uppercase">
              Adjusted property value
            </p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {formatCurrency(low)}–{high.toLocaleString("en-US")}
            </p>
          </div>

          <p className="mt-4 text-sm text-[#7A5C00]">{content.note}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {detailBoxes.map((box) => (
            <div key={box.label} className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-slate-500">{box.label}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {box.value}
              </p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAcceptOffer}
          disabled={isAccepting}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAccepting ? "Accepting offer..." : "Accept this offer"}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/timeline`)}
          className="mt-3 w-full rounded-full border border-gray-200 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
        >
          Change my timeline
        </button>

        <p className="mt-3 text-center text-xs text-slate-500">
          Nothing is signed here. Valid {OFFER_VALIDITY_DAYS} days.
        </p>

        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/offer/breakdown`)}
          className="mt-6 flex w-full items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-slate-900 transition-colors hover:bg-gray-100"
        >
          <span>Why this number?</span>
          <span aria-hidden="true" className="text-custom-blue">
            →
          </span>
        </button>
      </div>
    </StepsWrapper>
  );
};
