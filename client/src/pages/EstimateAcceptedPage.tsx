import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../components/icons";
import { useValuation } from "../context/ValuationContext";
import {
  CONDITION_ADJUSTMENT_PCT,
  ESTIMATED_VALUE,
  formatCurrency,
} from "../utils/estimate";

const WHAT_HAPPENS_NEXT = [
  {
    title: "We review your estimate",
    description:
      "Our team checks the property details and photos behind the number.",
  },
  {
    title: "We may reach out",
    description:
      "If anything needs confirming, someone from our team will contact you.",
  },
  {
    title: "Your estimate stays saved",
    description:
      "Revisit it anytime — nothing is signed and no offer has been made.",
  },
];

export const EstimateAcceptedPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { property } = useValuation();

  const locationLabel = property
    ? `${property.title}, ${property.subtitle.split(",")[0]}`
    : `Property #${addressId}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-blue-100 px-5 pt-6 pb-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-custom-yellow">
          <CheckIcon className="h-6 w-6 text-slate-900" />
        </span>
        <h1 className="mt-4 font-serif text-3xl leading-[1.15]">
          You've accepted your estimate.
        </h1>
        <p className="mt-3 text-xs text-slate-600">
          {locationLabel}. Nothing is signed, and no offer has been made —
          this simply confirms the estimate for your records.
        </p>
      </header>

      <main className="flex-1 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Estimated value
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatCurrency(ESTIMATED_VALUE)}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Condition adjustment
            </p>
            <p
              className={`mt-2 text-xl font-bold ${
                CONDITION_ADJUSTMENT_PCT < 0
                  ? "text-rose-800"
                  : "text-emerald-800"
              }`}
            >
              {CONDITION_ADJUSTMENT_PCT > 0 ? "+" : ""}
              {CONDITION_ADJUSTMENT_PCT}%
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-xs font-bold tracking-wider text-slate-500 uppercase">
          What happens next
        </h2>
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
          onClick={() => navigate(`/addresses/${addressId}/offer/confirmed`)}
          className="mt-8 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500"
        >
          Sounds good
        </button>

        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/offer`)}
          className="mt-3 w-full rounded-full border border-gray-200 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
        >
          Back
        </button>
      </main>
    </div>
  );
};
