import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AddressSuggestion, CreatePropertyRequest, NormalizedAddress } from "@pvt/shared";
import { MapPinIcon } from "../components/icons";
import { useValuation } from "../context/ValuationContext";
import { StepsWrapper } from "../components/StepsWrapper";
import {
  createProperty,
  getAddressDetails,
  reverseGeocodeAddress,
  searchAddresses,
} from "../services/api";

const PAGE_SIZE = 4;
const MIN_QUERY_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 300;
const CURRENT_LOCATION_ID = "current-location";

const splitLabel = (label: string) => {
  const commaIndex = label.indexOf(",");
  if (commaIndex === -1) return { primary: label, secondary: "" };
  return {
    primary: label.slice(0, commaIndex).trim(),
    secondary: label.slice(commaIndex + 1).trim(),
  };
};

const toCreatePropertyInput = (normalized: NormalizedAddress): CreatePropertyRequest => ({
  addressLine1: normalized.addressLine1,
  city: normalized.city,
  state: normalized.state,
  postalCode: normalized.postalCode,
  latitude: normalized.latitude,
  longitude: normalized.longitude,
  addressProvider: normalized.provider,
  providerPlaceId: normalized.providerPlaceId,
});

export const AddressPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  const { setProperty } = useValuation();

  const trimmedQuery = query.trim();
  const queryTooShort = trimmedQuery.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    if (queryTooShort) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);

      searchAddresses(trimmedQuery, controller.signal)
        .then((results) => {
          if (cancelled) return;
          setSuggestions(results);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          console.error("Failed to search addresses:", error);
          setSuggestions([]);
          setSearchError("Couldn't search addresses. Please try again.");
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery, queryTooShort]);

  const visibleSuggestions = queryTooShort ? [] : suggestions;
  const visibleMatches = visibleSuggestions.slice(0, visibleCount);
  const canShowMore = visibleCount < visibleSuggestions.length;
  const canCollapse = !canShowMore && visibleSuggestions.length > PAGE_SIZE;
  const showLoading = !queryTooShort && isSearching;
  const showError = !queryTooShort && searchError;

  const emptyStateLabel = showLoading
    ? "Searching…"
    : showError
      ? showError
      : trimmedQuery.length === 0
        ? "Start typing an address to search."
        : queryTooShort
          ? "Keep typing to search."
          : "No matches. Check the spelling or try a nearby street.";

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const selectNormalizedAddress = async (normalized: NormalizedAddress) => {
    const property = await createProperty(toCreatePropertyInput(normalized));
    setProperty(property);
    navigate(`/addresses/${property.id}/photos`);
  };

  const handleSelect = async (suggestion: AddressSuggestion) => {
    setSelectError(null);
    setSubmittingId(suggestion.id);
    try {
      const normalized = await getAddressDetails(suggestion.id);
      await selectNormalizedAddress(normalized);
    } catch (error) {
      console.error("Failed to select address:", error);
      setSelectError("Couldn't select that address. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleUseCurrentLocation = () => {
    setSelectError(null);

    if (!("geolocation" in navigator)) {
      setSelectError("Location isn't supported on this device. Please search instead.");
      return;
    }

    setSubmittingId(CURRENT_LOCATION_ID);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const normalized = await reverseGeocodeAddress(
              position.coords.latitude,
              position.coords.longitude,
            );
            await selectNormalizedAddress(normalized);
          } catch (error) {
            console.error("Failed to use current location:", error);
            setSelectError(
              "Couldn't find an address at your location. Please search instead.",
            );
          } finally {
            setSubmittingId(null);
          }
        })();
      },
      (error) => {
        console.error("Geolocation error:", error);
        setSelectError(
          error.code === error.PERMISSION_DENIED
            ? "Location access denied. Please search for your address instead."
            : "Couldn't get your location. Please search for your address instead.",
        );
        setSubmittingId(null);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
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
              onClick={handleUseCurrentLocation}
              disabled={submittingId !== null}
              className="flex w-full items-center gap-3 rounded-t-2xl bg-gray-50 px-4 py-3 text-left text-body-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400"
                aria-hidden="true"
              />
              {submittingId === CURRENT_LOCATION_ID
                ? "Locating…"
                : "Use my current location"}
            </button>
          </li>

          {visibleMatches.map((suggestion, index) => {
            const { primary, secondary } = splitLabel(suggestion.label);
            return (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  disabled={submittingId !== null}
                  className={`block w-full border-t border-gray-300 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                    index === visibleMatches.length - 1 ? "rounded-b-2xl" : ""
                  }`}
                >
                  <span className="block text-body-sm font-semibold text-gray-900">
                    {primary}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-gray-500">
                    {submittingId === suggestion.id ? "Selecting…" : secondary}
                  </span>
                </button>
              </li>
            );
          })}

          {visibleMatches.length === 0 && (
            <li className="rounded-b-2xl border-t border-gray-100 bg-white px-4 py-6 text-center text-xs text-gray-500">
              {emptyStateLabel}
            </li>
          )}
        </ul>

        {selectError && (
          <p className="mt-2 text-center text-xs text-red-600">{selectError}</p>
        )}

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
              ? `Show ${Math.min(PAGE_SIZE, visibleSuggestions.length - visibleCount)} more`
              : "Show less"}
          </button>
        )}
      </div>
    </StepsWrapper>
  );
};
