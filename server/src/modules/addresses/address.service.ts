import type { AddressSuggestion, NormalizedAddress } from "@pvt/shared";

const PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places";
const MIN_QUERY_LENGTH = 3;

export class PlaceNotFoundError extends Error {}
export class IncompleteAddressError extends Error {}

type GooglePlacePrediction = {
  placeId: string;
  text?: { text: string };
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
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
    },
    body: JSON.stringify({
      input: trimmedQuery,
      includedRegionCodes: ["US"],
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Places API request failed: ${response.status}`);
  }

  const data = (await response.json()) as GooglePlacesAutocompleteResponse;

  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is GooglePlacePrediction => Boolean(prediction))
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
        "X-Goog-FieldMask": "addressComponents,location",
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
