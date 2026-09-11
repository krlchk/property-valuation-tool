// TODO: mock — the starting value will come from comps/public records, and
// the condition adjustment will sum from the per-room AI photo analysis
// (once that UI exists on PropertyPhotosPage). Wire them together then; for
// now the estimate is just derived from these two flat placeholders.
//
// Shared between OfferPage and whatever reads the same "final number" later
// (the breakdown page, the accepted-estimate page, …) so there's one source
// of truth instead of each page hardcoding its own copy.
export const STARTING_VALUE = 500_000;
export const CONDITION_ADJUSTMENT_PCT = -7.75;
export const ADJUSTMENT_AMOUNT = Math.round(
  STARTING_VALUE * (CONDITION_ADJUSTMENT_PCT / 100),
);
export const ESTIMATED_VALUE = STARTING_VALUE + ADJUSTMENT_AMOUNT;

export const formatCurrency = (value: number) => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US")}`;
};
