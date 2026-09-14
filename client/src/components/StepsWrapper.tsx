import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useValuation } from "../context/ValuationContext";
import { MenuIcon } from "./icons";
import { Modal } from "./Modal";
import { StepHeader } from "./StepHeader";

type StepsWrapperProps = {
  children: ReactNode;
  stepHeaderCurrent: number;
  stepHeaderTotal: number;
  stepHeaderLabel: string;
  stepHeaderHideBack?: boolean;
  stepHeaderOnBack?: () => void;
};

export const StepsWrapper = ({
  children,
  stepHeaderCurrent,
  stepHeaderTotal,
  stepHeaderLabel,
  stepHeaderHideBack,
  stepHeaderOnBack,
}: StepsWrapperProps) => {
  const navigate = useNavigate();
  const { reset } = useValuation();
  const [isMenuOpen, setMenuOpen] = useState(false);

  const handleStartOver = () => {
    setMenuOpen(false);
    reset();
    navigate("/");
  };

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <header className="flex items-center justify-between border-b border-gray-200 py-5">
        <p className="font-semibold text-gray-400 text-[15px]">Your site</p>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </header>

      <Modal open={isMenuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <p className="text-sm text-slate-600">
          Starting over clears your address, photos, and answers so far.
        </p>
        <button
          type="button"
          onClick={handleStartOver}
          className="mt-4 w-full rounded-full border border-gray-200 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-50"
        >
          Start over
        </button>
      </Modal>

      <section>
        <p className="mt-5 text-label font-bold tracking-wider text-custom-blue uppercase">
          Free instant valuation
        </p>
        <h1 className="mt-4 font-serif text-hero leading-[1.15]">
          What's your property worth in cash?
        </h1>
        <p className="mt-3 text-[16px] text-gray-600">
          Photos in, cash range out — your number within 90 seconds.
        </p>
      </section>

      <main className="mt-3 rounded-3xl border border-gray-200">
        <div className="flex items-center justify-between rounded-t-3xl bg-blue-100 px-7 py-3">
          <div>
            <p className="text-sm font-bold text-brand-navy">instacashly</p>
            <p className="text-caption tracking-wider text-brand-navy-muted uppercase">
              Buying in Dallas–Fort Worth
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-amber-400"
              aria-hidden="true"
            />
            <p className="w-16 text-caption leading-tight tracking-wider text-brand-navy uppercase">
              7 offers today
            </p>
          </div>
        </div>

        <div className="rounded-b-3xl px-7 py-5">
          <StepHeader
            current={stepHeaderCurrent}
            total={stepHeaderTotal}
            label={stepHeaderLabel}
            hideBack={stepHeaderHideBack}
            onBack={stepHeaderOnBack}
          />
          {children}
        </div>
      </main>

      <p className="mt-5 text-[10.5px] text-gray-400">
        instacashly buys houses and land in Dallas–Fort Worth. Offers are
        estimates until confirmed in writing.
      </p>
    </div>
  );
};
