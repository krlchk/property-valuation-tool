import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type {
  AddressSuggestion,
  CreatePropertyRequest,
  NormalizedAddress,
} from "@pvt/shared";
import { MapPinIcon, XIcon } from "../components/icons";
import { useValuation } from "../context/ValuationContext";
import { StepsWrapper } from "../components/StepsWrapper";
import { addressService } from "../services/address.service";
import { propertyService } from "../services/property.service";

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

const toCreatePropertyInput = (
  normalized: NormalizedAddress,
  startingValue: number,
): CreatePropertyRequest => ({
  addressLine1: normalized.addressLine1,
  city: normalized.city,
  state: normalized.state,
  postalCode: normalized.postalCode,
  latitude: normalized.latitude,
  longitude: normalized.longitude,
  addressProvider: normalized.provider,
  providerPlaceId: normalized.providerPlaceId,
  startingValue: startingValue,
});

export const AddressPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPropertyId = searchParams.get("propertyId");
  const { property, setProperty, fetchPropertyById, reset } = useValuation();

  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [propertyPrice, setPropertyPrice] = useState<number | null>(
    () => property?.startingValue ?? null,
  );
  const [priceInput, setPriceInput] = useState<string>(() =>
    property?.startingValue
      ? property.startingValue.toLocaleString("en-US")
      : "",
  );

  const [selectedAddress, setSelectedAddress] =
    useState<NormalizedAddress | null>(() => {
      if (property && property.latitude != null && property.longitude != null) {
        return {
          addressLine1: property.addressLine1,
          city: property.city,
          state: property.state,
          postalCode: property.postalCode,
          latitude: property.latitude,
          longitude: property.longitude,
          provider: (property.addressProvider as any) ?? "mock",
          providerPlaceId: property.providerPlaceId ?? "",
        };
      }
      return null;
    });

  useEffect(() => {
    if (selectedPropertyId && property?.id !== selectedPropertyId) {
      fetchPropertyById(selectedPropertyId);
    }
  }, [selectedPropertyId, property?.id, fetchPropertyById]);

  useEffect(() => {
    if (!property) {
      setSelectedAddress(null);
      setPropertyPrice(null);
      setPriceInput("");
      return;
    }

    if (selectedPropertyId && property.id !== selectedPropertyId) return;

    setPropertyPrice(property.startingValue ?? null);
    setPriceInput(
      property.startingValue
        ? property.startingValue.toLocaleString("en-US")
        : "",
    );

    if (property.latitude != null && property.longitude != null) {
      setSelectedAddress({
        addressLine1: property.addressLine1,
        city: property.city,
        state: property.state,
        postalCode: property.postalCode,
        latitude: property.latitude,
        longitude: property.longitude,
        provider: (property.addressProvider as any) ?? "mock",
        providerPlaceId: property.providerPlaceId ?? "",
      });
    }
  }, [property, selectedPropertyId]);

  const trimmedQuery = query.trim();
  const queryTooShort = trimmedQuery.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    if (trimmedQuery.length === 0) {
      setSelectError(null);
    }
  }, [trimmedQuery]);

  useEffect(() => {
    if (queryTooShort) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);

      addressService
        .search(trimmedQuery, controller.signal)
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

  const searchStatusLabel = showLoading
    ? "Searching…"
    : showError
      ? showError
      : "No matches. Check the spelling or try a nearby street.";

  const canContinue = Boolean(selectedAddress);

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const rawDigits = event.target.value.replace(/[^0-9]/g, "");
    if (rawDigits === "") {
      setPriceInput("");
      setPropertyPrice(null);
      return;
    }
    const num = parseInt(rawDigits, 10);
    setPriceInput(num.toLocaleString("en-US"));
    setPropertyPrice(num);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setVisibleCount(PAGE_SIZE);
    setSelectError(null);
  };

  const handleSelect = async (suggestion: AddressSuggestion) => {
    setSelectError(null);
    setSubmittingId(suggestion.id);
    try {
      const normalized = await addressService.getDetails(suggestion.id);
      setSelectedAddress(normalized);
      setQuery("");
      setSuggestions([]);
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
      setSelectError(
        "Location isn't supported on this device. Please search instead.",
      );
      return;
    }

    setSubmittingId(CURRENT_LOCATION_ID);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          try {
            const normalized = await addressService.reverseGeocode(
              position.coords.latitude,
              position.coords.longitude,
            );
            setSelectedAddress(normalized);
            setQuery("");
            setSuggestions([]);
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

  const handleRemoveSelected = () => {
    setSelectedAddress(null);
    setPropertyPrice(null);
    setPriceInput("");
    setQuery("");
    setSuggestions([]);
    setSelectError(null);
    setSearchError(null);
    // Clear all valuation data (photos, timeline, contact, property)
    reset();
  };

  const handleContinue = async () => {
    if (!selectedAddress) return;

    if (
      property &&
      property.addressLine1 === selectedAddress.addressLine1 &&
      property.city === selectedAddress.city &&
      property.startingValue === propertyPrice
    ) {
      navigate(`/addresses/${property.id}/photos`);
      return;
    }

    setIsContinuing(true);
    setSelectError(null);
    try {
      const created = await propertyService.create(
        toCreatePropertyInput(selectedAddress, propertyPrice ?? 0),
      );
      setProperty(created);
      navigate(`/addresses/${created.id}/photos`);
    } catch (error) {
      console.error("Failed to save address:", error);
      setSelectError("Couldn't save that address. Please try again.");
    } finally {
      setIsContinuing(false);
    }
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
            {query.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Clear search"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        <ul className="mt-4 overflow-hidden rounded-2xl border border-gray-300">
          <li>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={submittingId !== null || isContinuing}
              className={`flex w-full items-center gap-3 bg-gray-50 px-4 py-3 text-left text-body-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${
                visibleMatches.length === 0 ? "rounded-2xl" : "rounded-t-2xl"
              }`}
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
                  disabled={submittingId !== null || isContinuing}
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
        </ul>

        {trimmedQuery.length >= MIN_QUERY_LENGTH &&
          visibleMatches.length === 0 && (
            <p className="mt-2 text-center text-xs text-gray-500">
              {searchStatusLabel}
            </p>
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

        {selectedAddress && (
          <div className="mt-6 rounded-2xl border-2 border-slate-900 bg-amber-50/60 p-4 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-custom-yellow text-slate-900">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-brand-navy uppercase">
                    Selected property
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedAddress.addressLine1}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {[
                      selectedAddress.city,
                      selectedAddress.state,
                      selectedAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveSelected}
                title="Remove selected address and clear data"
                aria-label="Remove selected address and clear data"
                className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-amber-100 hover:text-slate-700"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 border-t border-amber-200/80 pt-3">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="property-price"
                  className="text-xs font-semibold text-slate-800"
                >
                  Estimated property price
                </label>
              </div>
              <div className="relative mt-1.5 flex items-center rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
                <span className="mr-1 text-sm font-bold text-slate-500">$</span>
                <input
                  id="property-price"
                  type="text"
                  inputMode="numeric"
                  value={priceInput}
                  onChange={handlePriceChange}
                  className="w-full text-sm font-bold text-slate-900 outline-none placeholder:font-normal placeholder:text-gray-400"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Enter the price of your property.
              </p>
            </div>
          </div>
        )}

        {selectError && (
          <p className="mt-3 text-center text-xs text-red-600">{selectError}</p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || isContinuing}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-[#E8F4FD] disabled:opacity-50"
        >
          {isContinuing ? "Saving…" : "Continue"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          {canContinue
            ? "Next: add photos to sharpen the estimate"
            : "Select an address to continue"}
        </p>
      </div>
    </StepsWrapper>
  );
};
