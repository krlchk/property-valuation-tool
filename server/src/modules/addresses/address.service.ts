import type { AddressSuggestion, NormalizedAddress } from "@pvt/shared";
import { EXCLUDED_PROPERTIES } from "../../utils/exlcuded-props";

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const MIN_QUERY_LENGTH = 3;

export class PlaceNotFoundError extends Error {}
export class IncompleteAddressError extends Error {}

type GooglePlacePrediction = {
  placeId: string;
  text?: { text: string };
  types?: string [];
};

type GooglePlacesAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: GooglePlacePrediction;
  }>;
};

export const searchAddresses = async (query: string): Promise<AddressSuggestion[]> => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY environment variable");
  }

  const response = await fetch(PLACES_AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.types",
    },
    body: JSON.stringify({
      input: trimmedQuery,
      includedRegionCodes: ["US"],
      includedPrimaryTypes: ["street_address", "subpremise", "premise"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data = (await response.json()) as GooglePlacesAutocompleteResponse;

  console.log((data.suggestions ?? []).map((item) => item.placePrediction?.types))

  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is GooglePlacePrediction => Boolean(prediction))
    .filter((prediction) => {
      return !(prediction.types ?? []).some((type) => EXCLUDED_PROPERTIES.has(type));
    })
    .map((prediction) => ({
      id: prediction.placeId,
      label: prediction.text?.text ?? "",
    }));
};

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types: string[];
};

type GooglePlaceDetailsResponse = {
  addressComponents?: GoogleAddressComponent[];
  location?: { latitude: number; longitude: number };
  types?: string[];
};

const findComponent = (
  components: GoogleAddressComponent[],
  type: string,
): GoogleAddressComponent | undefined =>
  components.find((component) => component.types.includes(type));

export const getNormalizedAddress = async (
  placeId: string,
): Promise<NormalizedAddress> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY environment variable");
  }

  const response = await fetch(
    `${PLACES_DETAILS_URL}/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "addressComponents,location,types",
      },
    },
  );

  if (response.status === 404) {
    throw new PlaceNotFoundError("Google place was not found");
  }

  if (!response.ok) {
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data = (await response.json()) as GooglePlaceDetailsResponse;

  const placeTypes = data.types ?? [];
  const isExcludedType = placeTypes.some((type) => EXCLUDED_PROPERTIES.has(type));

  if (isExcludedType) {
    throw new IncompleteAddressError(
      "Selected location is a non-residential or public facility",
    );
  }

  const components = data.addressComponents ?? [];

  const country = findComponent(components, "country")?.shortText;
  if (country !== "US") {
    throw new IncompleteAddressError(
      "Selected place is not a US property address",
    );
  }

  const streetNumber = findComponent(components, "street_number")?.longText;
  const route = findComponent(components, "route")?.longText;
  const city =
    findComponent(components, "locality")?.longText ??
    findComponent(components, "postal_town")?.longText ??
    findComponent(components, "sublocality_level_1")?.longText;
  const state = findComponent(components, "administrative_area_level_1")?.shortText;
  const postalCode = findComponent(components, "postal_code")?.longText;
  const { latitude, longitude } = data.location ?? {};

  if (
    !streetNumber ||
    !route ||
    !city ||
    !state ||
    !postalCode ||
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    throw new IncompleteAddressError(
      "Selected place is missing required address details",
    );
  }

  return {
    addressLine1: `${streetNumber} ${route}`,
    city,
    state,
    postalCode,
    latitude,
    longitude,
    provider: "google",
    providerPlaceId: placeId,
  };
};

type GoogleGeocodeResponse = {
  status: string;
  results?: Array<{ place_id: string }>;
};

export const reverseGeocode = async (
  latitude: number,
  longitude: number,
): Promise<NormalizedAddress> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY environment variable");
  }

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("latlng", `${latitude},${longitude}`);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Google Geocoding API request failed: ${response.status}`);
  }

  const data = (await response.json()) as GoogleGeocodeResponse;

  if (data.status === "ZERO_RESULTS") {
    throw new PlaceNotFoundError("No address found for this location");
  }

  const placeId = data.results?.[0]?.place_id;
  if (data.status !== "OK" || !placeId) {
    throw new Error(`Google Geocoding API returned status: ${data.status}`);
  }

  // Reuse the same Place Details lookup + US/completeness validation used by
  // the autocomplete flow, so the two flows can never disagree on what
  // counts as a valid, normalizable US property address.
  return getNormalizedAddress(placeId);
};
