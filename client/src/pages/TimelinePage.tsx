import { useNavigate, useParams } from "react-router-dom";
import { StepsWrapper } from "../components/StepsWrapper";
import { ErrorState } from "../components/Error";
import { useValuation } from "../context/ValuationContext";
import type { OfferTerm } from "@pvt/shared";
import { propertyService } from "../services/property.service";
import { useEffect, useState } from "react";
import { offerTermsService } from "../services/offer-terms.service";

// type TimelineStep = {
//   id: TimelineOption;
//   label: string;
//   sublabel?: string;
// };

// const TIMELINE_STEPS: TimelineStep[] = [
//   { id: "asap", label: "ASAP" },
//   { id: "3-months", label: "Within", sublabel: "3 months" },
//   { id: "12-months", label: "Within", sublabel: "12 months" },
// ];

const formatClosingDaysLabel = (key: string): { label: string; sublabel?: string } => {
  if (key === "asap") return { label: "ASAP" };
  return { label: "Within", sublabel: key };
};

const formatTermContent = (term: OfferTerm) => {
  const discountPct = Math.round((1 - term.priceMultiplier) * 100);
  
  if (discountPct >= 15) {
    return {
      eyebrow: "Fastest way out",
      title: `Cash in your hand in ${term.closingDaysMin} days.`,
      description: `${term.inspectionDescription || "Waived inspection"}. Speed costs about ${discountPct}% of market value — that is the trade, stated plainly.`,
    };
  }

  if (discountPct > 0) {
    return {
      eyebrow: "Middle ground",
      title: `A ${term.closingDaysMin}-day close, short look.`,
      description: `${term.inspectionDescription || `${term.inspectionDays}-day inspection`}, then we close. You give up a little speed and pick up most of the difference in price.`,
    };
  }

  return {
    eyebrow: "Top of the range",
    title: "Full value, on a normal timeline.",
    description: `A standard close with a ${term.inspectionDays}-day due diligence window. You wait the longest and get the highest offer number.`,
  };
};

export const TimelinePage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { selectedTerm, setSelectedTerm, setProperty } = useValuation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [offerTerms, setOfferTerms] = useState<OfferTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    offerTermsService
      .getAll()
      .then((terms) => {
        if (isMounted) {
          const sorted = [...terms].sort((a, b) => a.priceMultiplier - b.priceMultiplier);
          setOfferTerms(sorted);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load offer terms:", err);
          setError("Failed to load offer terms. Please try again.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedIndex = selectedTerm ? offerTerms.findIndex((term) => term.id === selectedTerm.id) : -1;
  const content = selectedTerm ? formatTermContent(selectedTerm) : null;

  const stepCount = offerTerms.length;
  const trackInsetPct = stepCount > 0 ? 50 / stepCount : 0;
  const filledTrackPct = selectedIndex > 0 && stepCount > 0 ? (selectedIndex / (stepCount - 1)) * (100 - trackInsetPct * 2) : 0;

  const handleContinue = async () => {
    if (!selectedTerm || !addressId || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedProperty = await propertyService.update(addressId, {
        offerTermsId: selectedTerm.id,
      });
      setProperty(updatedProperty);
      navigate(`/addresses/${addressId}/contact`);
    } catch (error) {
      console.error("Failed to save selected offer term:", error);
      setSaveError("We couldn't save your timeline. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <StepsWrapper stepHeaderCurrent={3} stepHeaderTotal={4} stepHeaderLabel="Step 3 of 4 · Timeline">
        <ErrorState message={error} />
      </StepsWrapper>
    );
  }

  return (
    <StepsWrapper
      stepHeaderCurrent={3}
      stepHeaderTotal={4}
      stepHeaderLabel="Step 3 of 4 · Timeline"
    >
      <div className="mt-5">
        <h1 className="font-serif text-hero leading-[1.15]">
          How fast do you need out?
        </h1>
        <p className="mt-3 text-body-sm text-slate-600">
          This sets your terms. Speed costs money and patience earns it.
        </p>

        {isLoading ? (
          <div className="mt-6 animate-pulse rounded-2xl bg-blue-100 p-5">
            <div className="h-3 w-3/4 rounded bg-blue-200" />
            <div className="mt-6 h-2 rounded bg-blue-200" />
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="h-3 rounded bg-blue-200" />
              <div className="h-3 rounded bg-blue-200" />
              <div className="h-3 rounded bg-blue-200" />
            </div>
          </div>
        ) : (
        <div className="mt-6 rounded-2xl bg-blue-100 p-5">
          <div className="relative">
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-blue-200"
              style={{ left: `${trackInsetPct}%`, right: `${trackInsetPct}%` }}
            />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-custom-yellow transition-all duration-300"
              style={{ left: `${trackInsetPct}%`, width: `${filledTrackPct}%` }}
            />
            <div
              className="relative grid"
              style={{ gridTemplateColumns: `repeat(${stepCount}, minmax(0, 1fr))` }}
            >
              {offerTerms.map((term) => {
                const { label, sublabel } = formatClosingDaysLabel(term.key);
                const isSelected = selectedTerm?.id === term.id;

                return (
                  <div key={term.id} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(term)}
                      aria-pressed={isSelected}
                      aria-label={`${label}${sublabel ? ` ${sublabel}` : ""}`}
                      className={`h-5 w-5 shrink-0 rounded-full bg-white transition-colors ${
                        isSelected
                          // ? "border-[3px] border-custom-yellow"
                          ? "border-[3px] border-custom-yellow"
                          : "border-2 border-blue-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 text-xs">
            {offerTerms.map((term) => {
              const { label, sublabel } = formatClosingDaysLabel(term.key);
              const isSelected = selectedTerm?.id === term.id;

              return (
                <div
                  key={term.id}
                  className={`text-center ${
                    isSelected ? "font-bold text-slate-900" : "text-slate-500"
                  }`}
                >
                  {sublabel ? (
                    <>
                      <div>{label}</div>
                      <div>{sublabel}</div>
                    </>
                  ) : (
                    label
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {isLoading ? (
          <div className="mt-4 animate-pulse rounded-2xl bg-gray-100 p-5">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="mt-4 h-5 w-4/5 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-full rounded bg-gray-200" />
            <div className="mt-2 h-3 w-5/6 rounded bg-gray-200" />
          </div>
        ) : (
        <div
          className={`mt-4 rounded-2xl p-5 ${
            content ? "bg-yellow-100" : "bg-gray-50"
          }`}
        >
          <p
            className={`text-xs font-bold tracking-wider uppercase ${
              content ? "text-[#7A5C00]" : "text-slate-500"
            }`}
          >
            {content ? content.eyebrow : "Pick a point on the bar"}
          </p>
          <p className="mt-2 font-serif text-xl font-bold text-slate-900">
            {content ? content.title : "Your terms follow your timeline."}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {content
              ? content.description
              : "Pick ASAP, three months, or twelve months. Each one writes a different offer, and you can change it later without starting over."}
          </p>
        </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedTerm || isLoading || isSaving}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-[#E8F4FD] disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Continue"}
        </button>
        {saveError && (
          <p className="mt-2 text-center text-xs text-red-600">{saveError}</p>
        )}
        <p className="mt-2 text-center text-xs text-slate-500">
          {selectedTerm ? "You can move this later." : "Pick one to continue."}
        </p>
      </div>
    </StepsWrapper>
  );
};
