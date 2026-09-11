import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SmileIcon } from "../components/icons";

const OFFER_VALIDITY_DAYS = 14;

// TODO: mock — the starting value will come from comps/public records, and
// the condition adjustment will sum from the per-room AI photo analysis
// (once that UI exists on PropertyPhotosPage). Wire them together then;
// for now the estimate is just derived from these two flat placeholders.
const STARTING_VALUE = 500_000;
const CONDITION_ADJUSTMENT_PCT = -7.75;
const ADJUSTMENT_AMOUNT = Math.round(
  STARTING_VALUE * (CONDITION_ADJUSTMENT_PCT / 100),
);
const ESTIMATED_VALUE = STARTING_VALUE + ADJUSTMENT_AMOUNT;

const DETAIL_ROWS = [
  { label: "Closing date", value: "About 30 days" },
  { label: "Inspection", value: "5-day window" },
  { label: "Repairs", value: "None — we cover them" },
  { label: "Fees at closing", value: "$0" },
];

const RECENT_ACCEPTANCES = [
  { name: "Priya", city: "Keller", minutesAgo: 12 },
  { name: "Marcus", city: "Arlington", minutesAgo: 12 },
  { name: "Dana", city: "Haltom City", minutesAgo: 18 },
  { name: "Tasha", city: "Saginaw", minutesAgo: 24 },
  { name: "Sam", city: "Euless", minutesAgo: 31 },
];
const ACCEPTANCE_ROTATION_MS = 5_000;

const formatCurrency = (value: number) => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US")}`;
};

export const OfferPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();

  const [acceptanceIndex, setAcceptanceIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setAcceptanceIndex((prev) => (prev + 1) % RECENT_ACCEPTANCES.length);
    }, ACCEPTANCE_ROTATION_MS);

    return () => clearInterval(id);
  }, []);

  const acceptance = RECENT_ACCEPTANCES[acceptanceIndex];

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <header className="flex items-center justify-between">
        <p className="text-xs tracking-wider text-slate-500 uppercase">
          Valid {OFFER_VALIDITY_DAYS} days
        </p>
        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/photos`)}
          className="cursor-pointer text-sm font-medium text-custom-blue"
        >
          Add photos
        </button>
      </header>

      <main className="mt-8">
        <h1 className="font-serif text-4xl leading-[1.15]">
          Here's your offer.
        </h1>
        <p className="mt-3 text-xs text-slate-600">
          Priced for a thirty-day close. More photos sharpen the condition
          adjustment below.
        </p>

        <div className="mt-6 rounded-2xl bg-yellow-100 p-5">
          <p className="text-xs font-bold tracking-wider text-[#7A5C00] uppercase">
            Property value estimate
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
          </div>

          <div className="my-4 border-t border-[#7A5C00]/20" />

          <div>
            <p className="text-xs font-bold tracking-wider text-[#7A5C00] uppercase">
              Adjusted property value
            </p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {formatCurrency(ESTIMATED_VALUE)}
            </p>
          </div>

          <p className="mt-4 text-xs text-slate-900">
            Based on the visible condition of the uploaded property photos.
          </p>
        </div>

        <div className="mt-4 rounded-2xl bg-gray-50 p-4">
          {DETAIL_ROWS.map((row, index) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-3 text-sm ${
                index > 0 ? "border-t border-gray-200" : ""
              }`}
            >
              <span className="text-slate-500">{row.label}</span>
              <span className="font-semibold text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>

        <div
          aria-live="polite"
          className="mt-6 flex items-center gap-2 rounded-full bg-blue-100 px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-amber-400"
          />
          <p className="text-xs text-slate-700">
            {acceptance.name} in {acceptance.city} accepted{" "}
            {acceptance.minutesAgo} minutes ago
          </p>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500"
        >
          Accept this estimate
        </button>

        {/* TODO: wire up — explains how the estimate was priced. */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-slate-900">
          <span>Why this number?</span>
          <span aria-hidden="true" className="text-custom-blue">
            →
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 rounded-2xl border border-gray-200 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-custom-blue">
            <SmileIcon className="h-3 w-3 text-white" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Request a real human to review your photos
            </p>
            <p className="mt-1 text-[11px] text-slate-600">
              A buyer on our team checks every photo and confirms the offer.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
