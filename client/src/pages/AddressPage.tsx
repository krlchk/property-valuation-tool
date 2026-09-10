import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, MapPinIcon } from "../components/icons";
import { StepProgress } from "../components/StepProgress";
import { useValuation } from "../context/ValuationContext";

type Address = {
  title: string;
  subtitle: string;
};

const addressesArrayMock: Address[] = [
  {
    title: "3412 Kingsbury Ave",
    subtitle: "Fort Worth, TX 76110",
  },
  {
    title: "3412 Kingsbury Ave S",
    subtitle: "Arlington, TX 76015",
  },
  {
    title: "1204 Main St",
    subtitle: "Dallas, TX 75202",
  },
  {
    title: "850 Congress Ave",
    subtitle: "Austin, TX 78701",
  },
  {
    title: "1000 Louisiana St",
    subtitle: "Houston, TX 77002",
  },
  {
    title: "500 E San Antonio St",
    subtitle: "El Paso, TX 79901",
  },
  {
    title: "300 S Saint Marys St",
    subtitle: "San Antonio, TX 78205",
  },
  {
    title: "400 Austin Ave",
    subtitle: "Waco, TX 76701",
  },
  {
    title: "900 8th St",
    subtitle: "Wichita Falls, TX 76301",
  },
  {
    title: "220 N Main St",
    subtitle: "Fort Worth, TX 76102",
  },
  {
    title: "1500 Marilla St",
    subtitle: "Dallas, TX 75201",
  },
  {
    title: "111 E Pecan St",
    subtitle: "San Antonio, TX 78205",
  },
  {
    title: "700 Lavaca St",
    subtitle: "Austin, TX 78701",
  },
  {
    title: "1200 Smith St",
    subtitle: "Houston, TX 77002",
  },
  {
    title: "600 Camp St",
    subtitle: "Fort Worth, TX 76102",
  },
  {
    title: "200 W Abram St",
    subtitle: "Arlington, TX 76010",
  },
  {
    title: "300 E Main St",
    subtitle: "Arlington, TX 76010",
  },
  {
    title: "500 Taylor St",
    subtitle: "Fort Worth, TX 76102",
  },
  {
    title: "1401 McKinney St",
    subtitle: "Houston, TX 77010",
  },
  {
    title: "600 Congress Ave",
    subtitle: "Austin, TX 78701",
  },
];

const PAGE_SIZE = 4;

export const AddressPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { setProperty } = useValuation();

  const search = query.trim().toLowerCase();
  const matches = search
    ? addressesArrayMock.filter(
        (address) =>
          address.title.toLowerCase().includes(search) ||
          address.subtitle.toLowerCase().includes(search),
      )
    : addressesArrayMock;

  const visibleMatches = matches.slice(0, visibleCount);
  const canShowMore = visibleCount < matches.length;
  const canCollapse = !canShowMore && matches.length > PAGE_SIZE;

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSelect = (address: Address) => {
    setQuery(address.title);
    setVisibleCount(PAGE_SIZE);
    setProperty({
      subtitle: address.subtitle,
      title: address.title,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col p-5">
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
            Step 1 of 4 · Address
          </p>
        </div>
        <StepProgress current={1} total={4} className="mt-2" />
      </header>

      <main className="mt-8">
        <h1 className="font-serif text-[2rem] leading-[1.15]">
          Which property?
        </h1>

        <section
          aria-label="Address search"
          className="mt-5 rounded-2xl bg-blue-100 p-4"
        >
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="address" className="sr-only">
              Property address
            </label>
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
              <MapPinIcon className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                spellCheck={false}
                enterKeyHint="search"
                placeholder="Start typing an address"
                value={query}
                onChange={handleSearch}
                className="w-full text-lg text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </form>

          <ul className="mt-4">
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-t-2xl bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900 transition-colors hover:bg-gray-100"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400"
                  aria-hidden="true"
                />
                Use my current location
              </button>
            </li>

            {visibleMatches.map((address, index) => (
              <li key={`${address.title} ${address.subtitle}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(address)}
                  className={`block w-full border-t border-gray-100 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    index === visibleMatches.length - 1 ? "rounded-b-2xl" : ""
                  }`}
                >
                  <span className="block font-semibold text-gray-900">
                    {address.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-500">
                    {address.subtitle}
                  </span>
                </button>
              </li>
            ))}

            {visibleMatches.length === 0 && (
              <li className="rounded-b-2xl border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500">
                No matches. Check the spelling or try a nearby street.
              </li>
            )}
          </ul>

          {(canShowMore || canCollapse) && (
            <button
              type="button"
              onClick={() =>
                setVisibleCount((count) =>
                  canShowMore ? count + PAGE_SIZE : PAGE_SIZE,
                )
              }
              className="mt-2 w-full py-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              {canShowMore
                ? `Show ${Math.min(PAGE_SIZE, matches.length - visibleCount)} more`
                : "Show less"}
            </button>
          )}

          <p className="mt-3 px-1 text-sm text-slate-600">
            Pick the exact match so we price the right parcel.
          </p>
        </section>
      </main>

      <footer className="mt-auto">
        <p className="mt-5 text-center text-xs text-gray-500">
          Prototype — suggestions are a fixed list, not Google Places.
        </p>
      </footer>
    </div>
  );
};
