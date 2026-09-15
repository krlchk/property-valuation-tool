import { useNavigate, useParams } from "react-router-dom";
import { StepsWrapper } from "../components/StepsWrapper";
import { LoadingSpinner } from "../components/Loading";
import { useOfferData } from "../hooks/useOfferData";
import { useRequireStep } from "../hooks/useRequireStep";
import type { OfferTerm } from "@pvt/shared";
import {
  CONDITION_ADJUSTMENT_PCT,
  STARTING_VALUE,
  formatCurrency,
} from "../utils/estimate";
import {
  getOfferPriceRange,
} from "../utils/offerTerms";

const OFFER_VALIDITY_DAYS = 14;

// The two detail boxes that don't change with the chosen timeline.
const FIXED_DETAILS = [
  { label: "Repairs", value: "None — on us" },
  { label: "Fees at closing", value: "$0" },
];

// Page-specific copy per timeline — pricing/closing/inspection terms
// themselves live in utils/offerTerms.ts, shared with OfferHeldPage.
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
    subtitle: "Priced at full value on a normal timeline. More photos tighten the range.",
    note: `${term.inspectionDescription ?? `${term.inspectionDays}-day due diligence`}, a normal close, and the top number we can write.`,
  };
};

export const OfferPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const {
    property,
    selectedTerm,
    timelineAdjustmentPct,
    isLoading,
    error,
  } = useOfferData(addressId);
  useRequireStep("offer");

  if (isLoading) {
    return (
      <StepsWrapper stepHeaderCurrent={4} stepHeaderTotal={4} stepHeaderLabel="Your offer">
        <LoadingSpinner label="Loading your offer details..." />
      </StepsWrapper>
    );
  }

  if (error || !property || !selectedTerm) {
    return (
      <StepsWrapper stepHeaderCurrent={4} stepHeaderTotal={4} stepHeaderLabel="Your offer">
        <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">
            {error || "Unable to locate offer details."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Start Over
          </button>
        </div>
      </StepsWrapper>
    );
  }

  const startingValue = property?.startingValue ?? STARTING_VALUE;
  const conditionAdjustmentAmount = Math.round(
    startingValue * (CONDITION_ADJUSTMENT_PCT / 100),
  );
  const estimatedValue = startingValue + conditionAdjustmentAmount;

  const content = getOfferContent(selectedTerm);
  const terms = selectedTerm;

  const { low, high } = getOfferPriceRange(terms.priceMultiplier, estimatedValue);

  const timelineAdjustmentAmount = Math.round(
    estimatedValue * (terms.priceMultiplier - 1),
  );

  const detailBoxes = [
    {
      label: "Closing date",
      value: terms.closingDaysMax
        ? `${terms.closingDaysMin}–${terms.closingDaysMax} days`
        : `${terms.closingDaysMin} days`,
    },
    {
      label: "Inspection",
      value: terms.inspectionDescription ?? `${terms.inspectionDays}-day window`,
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
                  CONDITION_ADJUSTMENT_PCT < 0
                    ? "text-rose-800"
                    : "text-emerald-800"
                }`}
              >
                {CONDITION_ADJUSTMENT_PCT > 0 ? "+" : ""}
                {CONDITION_ADJUSTMENT_PCT}% ({conditionAdjustmentAmount > 0 ? "+" : ""}
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
          onClick={() => navigate(`/addresses/${addressId}/offer/held`)}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500"
        >
          Accept this offer
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
