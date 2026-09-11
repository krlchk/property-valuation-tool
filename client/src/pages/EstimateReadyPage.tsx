import { useParams } from "react-router-dom";
import { useValuation } from "../context/ValuationContext";
import { ESTIMATED_VALUE, formatCurrency } from "../utils/estimate";

const WHAT_HAPPENS_NEXT = [
  {
    title: "Your estimate is saved.",
    description: "You can return and review the valuation details at any time.",
  },
  {
    title: "No action is required right now.",
    description: "We may contact you if additional property information is needed.",
  },
  {
    title: "This estimate is not a binding offer.",
    description:
      "It is based on the property information, photos, and condition provided.",
  },
];

export const EstimateReadyPage = () => {
  const { addressId } = useParams<{ addressId: string }>();
  const { property, photos } = useValuation();

  // const referenceId = property?.id ?? addressId;

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <header className="flex items-center justify-between">
        <span className="text-lg font-bold">instacashly</span>
        {/* {referenceId && (
          <p className="text-xs tracking-wider text-slate-500 uppercase">
            Ref #{referenceId}
          </p>
        )} */}
      </header>

      <main className="mt-8 flex-1">
        <h1 className="font-serif text-4xl leading-[1.15]">
          That's everything we need.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Your property details have been submitted successfully. Your
          estimate is saved, and we'll let you know if any additional
          information is needed.
        </p>

        <div className="mt-6 rounded-2xl bg-blue-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
                {property?.title ?? `Property #${addressId}`}
              </p>
              {property?.subtitle && (
                <p className="mt-0.5 truncate text-xs text-slate-600">
                  {property.subtitle}
                </p>
              )}
            </div>
            <p className="shrink-0 text-sm font-semibold text-slate-700">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="my-4 border-t border-custom-blue/15" />

          <div className="flex items-end justify-between gap-3">
            <p className="text-xs font-bold tracking-wider text-custom-blue uppercase">
              Estimated property value
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(ESTIMATED_VALUE)}
            </p>
          </div>
        </div>

        <h2 className="mt-8 text-xs font-bold tracking-wider text-slate-500 uppercase">
          What happens next
        </h2>
        <ul className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {WHAT_HAPPENS_NEXT.map((step) => (
            <li key={step.title} className="py-4">
              <p className="text-sm font-bold text-slate-900">{step.title}</p>
              <p className="mt-1 text-xs text-slate-600">{step.description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-3xl bg-gray-50 p-6">
          <p className="text-sm font-bold text-slate-900">
            If something comes up first
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Call or text (817) 555–0100, 8am to 7pm. A person answers.
          </p>
        </div>
      </main>
    </div>
  );
};
