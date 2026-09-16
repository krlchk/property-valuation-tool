import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../components/icons";
import { ErrorState } from "../components/Error";
import { ProgressBar } from "../components/ProgressBar";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";
import { useRequireStep } from "../hooks/useRequireStep";
import { aiReviewService } from "../services/ai-review.service";
import { propertyService } from "../services/property.service";

const STEPS = [
  "Every photo read",
  "Condition understood",
  "Pricing the repairs",
  "Writing your offer",
];

const formatElapsed = (elapsedMs: number) => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const AnalyzingPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();

  const {
    property,
    photos,
    setConditionAdjustmentPct,
    setEstimatedPrice,
  } = useValuation();

  useRequireStep("offer");

  const [elapsedMs, setElapsedMs] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!property?.id || !addressId) return;

    let isMounted = true;
    const startedAt = performance.now();
    const timerId = window.setInterval(() => {
      if (isMounted) setElapsedMs(performance.now() - startedAt);
    }, 100);

    const runAssessment = async () => {
      setError(null);
      setCompletedSteps(0);
      setConditionAdjustmentPct(null);
      setEstimatedPrice(null);

      try {
        const review = await aiReviewService.reviewPropertyById(property.id);
        if (!isMounted) return;

        setConditionAdjustmentPct(review.totalAdjustmentPct);
        setCompletedSteps(2);

        const estimate = await propertyService.estimatePrice({
          propId: property.id,
          conditionAdjustmentPct: review.totalAdjustmentPct,
        });
        if (!isMounted) return;

        setEstimatedPrice(estimate.estimatedPrice);
        setCompletedSteps(STEPS.length);
        setElapsedMs(performance.now() - startedAt);
        navigate(`/addresses/${addressId}/offer`);
      } catch (requestError: unknown) {
        if (!isMounted) return;

        console.error("Failed to assess property:", requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to analyze this property. Please try again.",
        );
      }
    };

    void runAssessment();

    return () => {
      isMounted = false;
      window.clearInterval(timerId);
    };
  }, [
    addressId,
    navigate,
    property?.id,
    setConditionAdjustmentPct,
    setEstimatedPrice,
  ]);

  if (error) {
    return (
      <StepsWrapper
        stepHeaderCurrent={4}
        stepHeaderTotal={4}
        stepHeaderLabel="Pricing your property"
        stepHeaderHideBack
      >
        <ErrorState message={error} />
      </StepsWrapper>
    );
  }

  const progressPct = (completedSteps / STEPS.length) * 100;

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
              {formatElapsed(elapsedMs)}
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
            const done = index < completedSteps;
            const active = index === completedSteps;
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
