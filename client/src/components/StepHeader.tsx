import { useNavigate } from "react-router-dom";
import { StepProgress } from "./StepProgress";

type StepHeaderProps = {
  current: number;
  total?: number;
  label: string;
  hideBack?: boolean;
};

export const StepHeader = ({
  current,
  total = 4,
  label,
  hideBack = false,
}: StepHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header>
      <StepProgress current={current} total={total} className="mt-2" />
      <div className="flex items-center justify-between">
        <p className="mt-2 text-label font-semibold tracking-wider text-custom-blue uppercase">
          {label}
        </p>
        {current > 1 && !hideBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="-ml-1 mt-2 cursor-pointer p-1 text-label text-gray-500"
          >
            Back
          </button>
        )}
      </div>
    </header>
  );
};
