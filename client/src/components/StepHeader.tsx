import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "./icons";
import { StepProgress } from "./StepProgress";

type StepHeaderProps = {
  current: number;
  total?: number;
  label: string;
};

export const StepHeader = ({ current, total = 4, label }: StepHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="-ml-1 rounded-full p-1 text-gray-900 transition-colors hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
          {label}
        </p>
      </div>
      <StepProgress current={current} total={total} className="mt-2" />
    </header>
  );
};
