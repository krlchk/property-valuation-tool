import { useEffect } from "react";
import { XIcon } from "./icons";

const AUTO_DISMISS_MS = 4_000;

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

export const Toast = ({ message, onDismiss }: ToastProps) => {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-5 bottom-5 z-50 mx-auto w-fit max-w-[calc(100%-2.5rem)] overflow-hidden rounded-2xl bg-slate-900 shadow-lg"
    >
      <div className="flex items-center gap-3 py-2.5 pr-2 pl-4">
        <p className="text-xs font-medium text-white">{message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="h-0.5 bg-white/20">
        {/* key={message} restarts the shrink animation whenever the
         * message text actually changes (a fresh mount, not a re-render). */}
        <div
          key={message}
          className="h-full bg-custom-yellow"
          style={{
            animation: `toast-shrink ${AUTO_DISMISS_MS}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};
