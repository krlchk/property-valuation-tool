import type { OfferTerm } from "@pvt/shared";
import type { TimelineOption } from "../types/timeline";
// import { ESTIMATED_VALUE } from "./estimate";

// Reasonable default while the user hasn't picked a timeline yet (e.g.
// landed on /offer or /offer/held directly) — mirrors the old flat
// "thirty-day close" copy.
export const DEFAULT_TIMELINE: TimelineOption = "3-months";

export type OfferTerms = {
  priceMultiplier: number;
  closingDate: string;
  inspection: string;
  /** Condensed one-line version of closingDate + inspection, for recap UI
   * like OfferHeldPage's summary card. */
  summary: string;
};

// TODO: business logic still being worked out (see TimelinePage) — for now,
// picking a faster close trades off price the way the TimelinePage copy
// describes it (ASAP ~20% below full value, 12 months = full ESTIMATED_VALUE).
// Shared by OfferPage and OfferHeldPage so the held-offer recap always
// matches what was shown on the offer itself.
export const TIMELINE_OFFER_TERMS: Record<TimelineOption, OfferTerms> = {
  asap: {
    priceMultiplier: 0.8,
    closingDate: "7 days from signing",
    inspection: "Waived entirely",
    summary: "7 days, no inspection",
  },
  "3-months": {
    priceMultiplier: 0.92,
    closingDate: "About 30 days",
    inspection: "5-day window",
    summary: "30 days, 5-day inspection",
  },
  "12-months": {
    priceMultiplier: 1,
    closingDate: "30–45 days",
    inspection: "10-day due diligence",
    summary: "30–45 days, 10-day inspection",
  },
};


export const formatOfferTermsSummary = ({
  closingDaysMin,
  closingDaysMax,
  inspectionDays,
}: OfferTerm): string => {
  const closingText = closingDaysMax && closingDaysMax !== closingDaysMin
    ? `${closingDaysMin}–${closingDaysMax} days`
    : `${closingDaysMin} days`;

  const inspectionText = inspectionDays === 0
    ? "no inspection"
    : `${inspectionDays}-day inspection`;

  return `${closingText}, ${inspectionText}`;
};

// Cosmetic spread around the timeline-adjusted midpoint, just so the offer
// reads as a range (like the design) instead of one crisp number.
const RANGE_SPREAD_PCT = 0.02;
const roundToHundred = (value: number) => Math.round(value / 100) * 100;

export const getOfferPriceRange = (priceMultiplier: number, estimatedPrice: number) => {
  const midpoint = roundToHundred(estimatedPrice * priceMultiplier);
  return {
    low: roundToHundred(midpoint * (1 - RANGE_SPREAD_PCT / 2)),
    high: roundToHundred(midpoint * (1 + RANGE_SPREAD_PCT / 2)),
  };
};
