import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../components/icons";
import { ProgressBar } from "../components/ProgressBar";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";

// TODO: swap for the real AI processing time once that's wired up.
const DURATION_MS = 10_000;
const TICK_MS = 100;

const STEPS = [
  "Every photo read",
  "Condition understood",
  "Pricing the repairs",
  "Writing your offer",
];

const formatCountdown = (remainingMs: number) => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const AnalyzingPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { photos } = useValuation();

  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += TICK_MS;
      if (elapsed >= DURATION_MS) {
        clearInterval(id);
        setElapsedMs(DURATION_MS);
        navigate(`/addresses/${addressId}/offer`);
        return;
      }
      setElapsedMs(elapsed);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [addressId, navigate]);

  const progressPct = (elapsedMs / DURATION_MS) * 100;
  const remainingMs = DURATION_MS - elapsedMs;
  const doneCount = Math.min(
    Math.floor((elapsedMs / DURATION_MS) * STEPS.length),
    STEPS.length,
  );

  return (
    <StepsWrapper
      stepHeaderCurrent={4}
      stepHeaderTotal={4}
      stepHeaderLabel="Pricing your property"
      stepHeaderHideBack
    >
      <div className="mt-5">
        <div className="rounded-2xl bg-blue-100 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-label font-bold tracking-wider text-slate-600 uppercase">
              Reading {photos.length} photo{photos.length === 1 ? "" : "s"}
            </p>
            <p className="font-mono text-2xl font-bold text-slate-900">
              {formatCountdown(remainingMs)}
            </p>
          </div>
          <ProgressBar percent={progressPct} className="mt-3" />
        </div>

        <h1 className="mt-8 font-serif text-hero leading-[1.15]">
          Pricing the condition.
        </h1>
        <p className="mt-3 text-body-sm text-slate-600">
          No forms and no phone calls. Just the photos you already sent.
        </p>

        <ul aria-live="polite" className="mt-6 space-y-2">
          {STEPS.map((step, index) => {
            const done = index < doneCount;
            const active = index === doneCount;
            return (
              <li
                key={step}
                className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3"
              >
                {done ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-custom-blue" />
                ) : active ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-amber-400" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-300"
                  />
                )}
                <span
                  className={`text-sm ${
                    done || active
                      ? "font-medium text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="font-mono text-caption tracking-wider text-slate-400 uppercase">
            Stay on this page — we'll text you if it runs long.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/addresses/${addressId}/offer`)}
            className="shrink-0 cursor-pointer text-sm font-medium text-custom-blue"
          >
            Skip →
          </button>
        </div>
      </div>
    </StepsWrapper>
  );
};
