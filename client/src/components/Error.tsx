
interface ErrorStateProps {
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorState = ({
  message,
  title,
  actionLabel,
  onAction,
}: ErrorStateProps) => {
  return (
    <div className="mt-8 rounded-2xl bg-red-50 p-6 text-center">
      {title && <p className="text-sm font-bold text-red-900">{title}</p>}
      <p className="text-sm font-semibold text-red-800">{message}</p>
      {onAction && actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
