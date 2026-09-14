import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinIcon } from "../components/icons";
import { useValuation } from "../context/ValuationContext";
import type { Address } from "../types/address";
import { StepsWrapper } from "../components/StepsWrapper";

const addressesArrayMock: Address[] = [
  {
    id: "1",
    title: "3412 Kingsbury Ave",
    subtitle: "Fort Worth, TX 76110",
  },
  {
    id: "2",
    title: "3412 Kingsbury Ave S",
    subtitle: "Arlington, TX 76015",
  },
  {
    id: "3",
    title: "1204 Main St",
    subtitle: "Dallas, TX 75202",
  },
  {
    id: "4",
    title: "850 Congress Ave",
    subtitle: "Austin, TX 78701",
  },
  {
    id: "5",
    title: "1000 Louisiana St",
    subtitle: "Houston, TX 77002",
  },
  {
    id: "6",
    title: "500 E San Antonio St",
    subtitle: "El Paso, TX 79901",
  },
  {
    id: "7",
    title: "300 S Saint Marys St",
    subtitle: "San Antonio, TX 78205",
  },
  {
    id: "8",
    title: "400 Austin Ave",
    subtitle: "Waco, TX 76701",
  },
  {
    id: "9",
    title: "900 8th St",
    subtitle: "Wichita Falls, TX 76301",
  },
  {
    id: "10",
    title: "220 N Main St",
    subtitle: "Fort Worth, TX 76102",
  },
  {
    id: "11",
    title: "1500 Marilla St",
    subtitle: "Dallas, TX 75201",
  },
  {
    id: "12",
    title: "111 E Pecan St",
    subtitle: "San Antonio, TX 78205",
  },
  {
    id: "13",
    title: "700 Lavaca St",
    subtitle: "Austin, TX 78701",
  },
  {
    id: "14",
    title: "1200 Smith St",
    subtitle: "Houston, TX 77002",
  },
  {
    id: "15",
    title: "600 Camp St",
    subtitle: "Fort Worth, TX 76102",
  },
  {
    id: "16",
    title: "200 W Abram St",
    subtitle: "Arlington, TX 76010",
  },
  {
    id: "17",
    title: "300 E Main St",
    subtitle: "Arlington, TX 76010",
  },
  {
    id: "18",
    title: "500 Taylor St",
    subtitle: "Fort Worth, TX 76102",
  },
  {
    id: "19",
    title: "1401 McKinney St",
    subtitle: "Houston, TX 77010",
  },
  {
    id: "20",
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
    setProperty({
      id: address.id,
      title: address.title,
      subtitle: address.subtitle,
    });
    navigate(`/addresses/${address.id}/photos`);
  };

  return (
    <StepsWrapper
      stepHeaderCurrent={1}
      stepHeaderTotal={4}
      stepHeaderLabel="Step 1 of 4 · Address"
    >
      <div className="mt-5">
        <h1 className="font-serif text-hero leading-[1.15]">Which property?</h1>
        <p className="mt-1 text-body-sm text-slate-600">
          Pick the exact match so we price the right parcel.
        </p>

        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="address" className="sr-only">
            Property address
          </label>
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-3">
            <MapPinIcon className="h-4 w-4 shrink-0 text-gray-400" />
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
              className="w-full text-xs text-gray-900 outline-none placeholder:text-body-sm placeholder:text-gray-400"
            />
          </div>
        </form>

        <ul className="mt-4 rounded-2xl border border-gray-300">
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-t-2xl bg-gray-50 px-4 py-3 text-left text-body-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400"
                aria-hidden="true"
              />
              Use my current location
            </button>
          </li>

          {visibleMatches.map((address, index) => (
            <li key={address.id}>
              <button
                type="button"
                onClick={() => handleSelect(address)}
                className={`block w-full border-t border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                  index === visibleMatches.length - 1 ? "rounded-b-2xl" : ""
                }`}
              >
                <span className="block text-body-sm font-semibold text-gray-900">
                  {address.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  {address.subtitle}
                </span>
              </button>
            </li>
          ))}

          {visibleMatches.length === 0 && (
            <li className="rounded-b-2xl border-t border-gray-100 bg-white px-4 py-6 text-center text-xs text-gray-500">
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
            className="mt-2 w-full cursor-pointer py-2 text-xs font-medium text-custom-blue"
          >
            {canShowMore
              ? `Show ${Math.min(PAGE_SIZE, matches.length - visibleCount)} more`
              : "Show less"}
          </button>
        )}
      </div>
    </StepsWrapper>
  );
};
