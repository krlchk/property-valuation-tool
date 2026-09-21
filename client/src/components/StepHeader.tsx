import { StepProgress } from "./StepProgress";

type StepHeaderProps = {
  current: number;
  total?: number;
  label: string;
  hideBack?: boolean;
  /** Override the default browser-history back navigation — e.g. OfferPage
   * routes Back to /timeline instead of AnalyzingPage (which would just
   * auto-redirect forward again). */
  onBack?: () => void;
};

export const StepHeader = ({
  current,
  total = 4,
  label,
  hideBack = false,
  onBack,
}: StepHeaderProps) => {
  return (
    <header>
      <StepProgress current={current} total={total} className="mt-2" />
      <div className="flex items-center justify-between">
        <p className="mt-2 text-label font-semibold tracking-wider text-custom-blue uppercase">
          {label}
        </p>
        {current > 1 && !hideBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="mt-2 -ml-1 cursor-pointer p-1 text-label text-gray-500"
          >
            Back
          </button>
        )}
      </div>
    </header>
  );
};
