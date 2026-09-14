import { useNavigate, useParams } from "react-router-dom";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";
import type { TimelineOption } from "../types/timeline";

type TimelineStep = {
  id: TimelineOption;
  label: string;
  sublabel?: string;
};

const TIMELINE_STEPS: TimelineStep[] = [
  { id: "asap", label: "ASAP" },
  { id: "3-months", label: "Within", sublabel: "3 months" },
  { id: "12-months", label: "Within", sublabel: "12 months" },
];

const TIMELINE_CONTENT: Record<
  TimelineOption,
  { eyebrow: string; title: string; description: string }
> = {
  asap: {
    eyebrow: "Fastest way out",
    title: "Cash in your hand in seven days.",
    description:
      "We waive the inspection, cover every repair, and close on whatever day you name. Speed costs about twenty percent of market — that is the trade, stated plainly.",
  },
  "3-months": {
    eyebrow: "Middle ground",
    title: "A thirty-day close, a short look.",
    description:
      "Five business days of due diligence, then we close. You give up a little speed and pick up most of the difference in price.",
  },
  "12-months": {
    eyebrow: "Top of the range",
    title: "Full value, on a normal timeline.",
    description:
      "A standard close with a ten-day due diligence window. You wait the longest and you get the highest number we can write.",
  },
};

export const TimelinePage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { timeline: selection, setTimeline: setSelection } = useValuation();

  const selectedIndex =
    selection === null
      ? -1
      : TIMELINE_STEPS.findIndex((step) => step.id === selection);
  const content = selection ? TIMELINE_CONTENT[selection] : null;

  const stepCount = TIMELINE_STEPS.length;
  const trackInsetPct = 50 / stepCount;
  const filledTrackPct =
    selectedIndex > 0 ? (selectedIndex / stepCount) * 100 : 0;

  const handleContinue = () => {
    if (!selection) return;
    navigate(`/addresses/${addressId}/contact`);
  };

  return (
    <StepsWrapper
      stepHeaderCurrent={3}
      stepHeaderTotal={4}
      stepHeaderLabel="Step 3 of 4 · Timeline"
    >
      <div className="mt-5">
        <h1 className="font-serif text-hero leading-[1.15]">
          How fast do you need out?
        </h1>
        <p className="mt-3 text-body-sm text-slate-600">
          This sets your terms. Speed costs money and patience earns it.
        </p>

        <div className="mt-6 rounded-2xl bg-blue-100 p-5">
          <div className="relative">
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-blue-200"
              style={{ left: `${trackInsetPct}%`, right: `${trackInsetPct}%` }}
            />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-custom-yellow transition-all duration-300"
              style={{ left: `${trackInsetPct}%`, width: `${filledTrackPct}%` }}
            />

            <div className="relative grid grid-cols-3">
              {TIMELINE_STEPS.map((step) => (
                <div key={step.id} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setSelection(step.id)}
                    aria-pressed={selection === step.id}
                    aria-label={`${step.label}${step.sublabel ? ` ${step.sublabel}` : ""}`}
                    className={`h-5 w-5 shrink-0 rounded-full bg-white transition-colors ${
                      selection === step.id
                        ? "border-[3px] border-custom-yellow"
                        : "border-2 border-blue-200"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 text-xs">
            {TIMELINE_STEPS.map((step) => (
              <div
                key={step.id}
                className={`text-center ${
                  selection === step.id
                    ? "font-bold text-slate-900"
                    : "text-slate-500"
                }`}
              >
                {step.sublabel ? (
                  <>
                    <div>{step.label}</div>
                    <div>{step.sublabel}</div>
                  </>
                ) : (
                  step.label
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mt-4 rounded-2xl p-5 ${
            content ? "bg-yellow-100" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-xs font-bold tracking-wider uppercase ${
              content ? "text-[#7A5C00]" : "text-slate-500"
            }`}
          >
            {content ? content.eyebrow : "Pick a point on the bar"}
          </p>
          <p className="mt-2 font-serif text-xl font-bold text-slate-900">
            {content ? content.title : "Your terms follow your timeline."}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {content
              ? content.description
              : "Pick ASAP, three months, or twelve months. Each one writes a different offer, and you can change it later without starting over."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selection}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-[#E8F4FD] disabled:opacity-50"
        >
          Continue
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          {selection ? "You can move this later." : "Pick one to continue."}
        </p>
      </div>
    </StepsWrapper>
  );
};
