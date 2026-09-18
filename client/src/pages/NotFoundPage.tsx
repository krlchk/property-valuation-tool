import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useValuation } from "../context/ValuationContext";
import { MenuIcon } from "../components/icons";
import { Modal } from "../components/Modal";

export const NotFoundPage = () => {
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
        <p className="text-[15px] font-semibold text-gray-400">Your site</p>
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
          404 — Page Not Found
        </p>
        <h1 className="mt-4 font-serif text-hero leading-[1.15]">
          Looks like you're off the map.
        </h1>
        <p className="mt-3 text-[16px] text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </section>

      <main className="mt-3 flex flex-1 flex-col rounded-3xl border border-gray-200">
        <div className="flex items-center justify-between rounded-t-3xl bg-blue-100 px-7 py-3">
          <div>
            <p className="text-sm font-bold text-brand-navy">Instacashly</p>
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

        <div className="flex flex-1 flex-col items-center justify-center rounded-b-3xl px-7 py-8 text-center">
          <p className="text-lg text-gray-600">
            Let’s get you back on track to see what your home is worth.
          </p>

          <button
            type="button"
            onClick={handleStartOver}
            className="mt-6 cursor-pointer rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Go to valuation
          </button>
        </div>
      </main>

      <p className="mt-5 text-[10.5px] text-gray-400">
        Instacashly buys houses and land in Dallas–Fort Worth. Offers are
        estimates until confirmed in writing.
      </p>
    </div>
  );
};
