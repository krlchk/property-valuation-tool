import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";
import { useValuation } from "../context/ValuationContext";
import { aiReviewService } from "../services/ai-review.service";
import type { PropertyRepairReview } from "@pvt/shared";

type RepairLineItem = {
  title: string;
  amount: number;
  note?: string;
  noteTone?: "muted" | "warning";
};

const formatComponentName = (component: string) =>
  component
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toRepairLineItem = (review: PropertyRepairReview): RepairLineItem => ({
  title:
    review.reviewResponse?.title || formatComponentName(review.componentKey),
  amount:
    review.estimatedRepairPrice !== 0
      ? Number(review.estimatedRepairPrice) * -1
      : 0,
  note: review.reviewResponse?.note,
  noteTone: review.reviewResponse?.noteTone === "warning" ? "warning" : "muted",
});

const formatNumber = (value: number) => value.toLocaleString("en-US");

export const RepairBreakdownPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { aiReviewId } = useValuation();

  const [repairReviews, setRepairReviews] = useState<PropertyRepairReview[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!aiReviewId) {
      setError("No AI review is available for this property.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    aiReviewService
      .getPropertyRepairReviews(aiReviewId)
      .then((reviews) => {
        if (isMounted) setRepairReviews(reviews);
      })
      .catch((requestError: unknown) => {
        if (!isMounted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load repair details.",
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [aiReviewId]);

  const repairItems = repairReviews.map(toRepairLineItem);
  const totalRepairCost = repairItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <h1 className="sr-only">Why this number</h1>

      <header>
        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/offer`)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to my offer
        </button>
      </header>

      <main className="mt-6">
        <div className="rounded-2xl bg-blue-100 p-5">
          <p className="text-xs font-bold tracking-wider text-custom-blue uppercase">
            What we'll fix, at our cost
          </p>
          <p className="mt-2 text-4xl font-bold text-slate-900">
            ${formatNumber(totalRepairCost)}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            This comes off the after-repair value. You pay none of it.
          </p>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-slate-600">
            Loading repair details...
          </p>
        ) : error ? (
          <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : repairItems.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-slate-600">
            No repair items were identified in this review.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {repairItems.map((item) => (
              <li
                key={`${item.title}-${item.amount}`}
                className={`rounded-2xl p-4 ${
                  item.noteTone === "warning" ? "bg-yellow-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-bold text-slate-900">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-sm font-bold text-slate-900">
                    {formatNumber(item.amount)}
                  </span>
                </div>

                {item.note && (
                  <p
                    className={`mt-1 text-xs ${
                      item.noteTone === "warning"
                        ? "text-[#7A5C00]"
                        : "text-slate-600"
                    }`}
                  >
                    {item.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => navigate(`/addresses/${addressId}/photos`)}
          className="w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500"
        >
          Add more photos
        </button>
      </footer>
    </div>
  );
};
