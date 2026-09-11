import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "../components/icons";

type RepairLineItem = {
  title: string;
  amount: number;
  note?: string;
  noteTone?: "muted" | "warning";
  /** How many supporting photo thumbnails to show, if any. */
  photoCount?: number;
};

// TODO: mock — will be generated from the per-room AI photo analysis once
// that pipeline exists (see PropertyPhotosPage). Each line will cite the
// actual photos it was priced from instead of a placeholder count.
const REPAIR_ITEMS: RepairLineItem[] = [
  {
    title: "Roof — full replacement",
    amount: 14_800,
    note: "Curled shingles, decking exposed at the valley",
    photoCount: 2,
  },
  {
    title: "Foundation — pier & beam leveling",
    amount: 21_500,
    note: "Door gaps inside, stair-step crack in the brick",
    photoCount: 2,
  },
  {
    title: "Kitchen — full gut",
    amount: 16_200,
    note: "Cabinets, counters, flooring, appliances",
  },
  {
    title: "Bathrooms (2) — full gut",
    amount: 11_400,
    note: "We guessed here — we have no bathroom photos",
    noteTone: "warning",
  },
  {
    title: "Water damage, exterior paint & siding",
    amount: 14_500,
  },
];

const TOTAL_REPAIR_COST = REPAIR_ITEMS.reduce(
  (sum, item) => sum + item.amount,
  0,
);

const formatNumber = (value: number) => value.toLocaleString("en-US");

export const RepairBreakdownPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();

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
            ${formatNumber(TOTAL_REPAIR_COST)}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            This comes off the after-repair value. You pay none of it.
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {REPAIR_ITEMS.map((item) => (
            <li
              key={item.title}
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

              {item.photoCount ? (
                <div className="mt-2 flex gap-2">
                  {Array.from({ length: item.photoCount }, (_, index) => (
                    <div
                      key={index}
                      aria-hidden="true"
                      className="h-14 w-14 rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
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
