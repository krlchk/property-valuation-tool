import { useNavigate, useParams } from "react-router-dom";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";
import { useRequireStep } from "../hooks/useRequireStep";
import type { TimelineOption } from "../types/timeline";
import {
  ADJUSTMENT_AMOUNT,
  CONDITION_ADJUSTMENT_PCT,
  ESTIMATED_VALUE,
  STARTING_VALUE,
  formatCurrency,
} from "../utils/estimate";
import {
  DEFAULT_TIMELINE,
  TIMELINE_OFFER_TERMS,
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
const TIMELINE_OFFER_CONTENT: Record<
  TimelineOption,
  { eyebrow: string; subtitle: string; note: string }
> = {
  asap: {
    eyebrow: "Seven-day cash offer",
    subtitle: "Priced for a seven-day close. More photos tighten the range.",
    note: "No inspection, no repairs, no fees. Name the closing day and we hit it.",
  },
  "3-months": {
    eyebrow: "Thirty-day offer",
    subtitle: "Priced for a thirty-day close. More photos tighten the range.",
    note: "A five-day look at the property, then we close. Repairs still on us.",
  },
  "12-months": {
    eyebrow: "Full-value offer",
    subtitle:
      "Priced at full value on a normal timeline. More photos tighten the range.",
    note: "Ten days of due diligence, a normal close, and the top number we can write.",
  },
};

export const OfferPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { timeline } = useValuation();
  useRequireStep("offer");

  const selectedTimeline = timeline ?? DEFAULT_TIMELINE;
  const content = TIMELINE_OFFER_CONTENT[selectedTimeline];
  const terms = TIMELINE_OFFER_TERMS[selectedTimeline];

  const { low, high } = getOfferPriceRange(terms.priceMultiplier);

  const timelineAdjustmentPct = Math.round((terms.priceMultiplier - 1) * 100);
  const timelineAdjustmentAmount = Math.round(
    ESTIMATED_VALUE * (terms.priceMultiplier - 1),
  );

  const detailBoxes = [
    { label: "Closing date", value: terms.closingDate },
    { label: "Inspection", value: terms.inspection },
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
                {formatCurrency(STARTING_VALUE)}
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
                {CONDITION_ADJUSTMENT_PCT}% ({ADJUSTMENT_AMOUNT > 0 ? "+" : ""}
                {formatCurrency(ADJUSTMENT_AMOUNT)})
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
