type StepProgressProps = {
  current: number;
  total?: number;
  className?: string;
};

export const StepProgress = ({
  current,
  total = 4,
  className = "",
}: StepProgressProps) => (
  <div
    role="progressbar"
    aria-valuemin={1}
    aria-valuemax={total}
    aria-valuenow={current}
    aria-label={`Step ${current} of ${total}`}
    className={`flex gap-1.5 ${className}`}
  >
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={`h-1 flex-1 rounded-full ${
          index < current ? "bg-yellow-400" : "bg-gray-200"
        }`}
      />
    ))}
  </div>
);
