type ProgressBarProps = {
  percent: number;
  className?: string;
};

export const ProgressBar = ({ percent, className = "" }: ProgressBarProps) => (
  <div
    className={`h-2 w-full overflow-hidden rounded-full bg-white ${className}`}
  >
    <div
      className="h-full rounded-full bg-custom-yellow transition-[width] duration-300"
      style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
    />
  </div>
);
