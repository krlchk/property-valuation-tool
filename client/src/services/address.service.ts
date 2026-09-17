import type { AddressSuggestion, NormalizedAddress } from "@pvt/shared";
import { request } from "./api";

export const addressService = {
  search: (
    query: string,
    signal?: AbortSignal,
  ): Promise<AddressSuggestion[]> => {
    return request<AddressSuggestion[]>(
      `/addresses/search?q=${encodeURIComponent(query)}`,
      { signal },
    );
  },

  getDetails: (placeId: string): Promise<NormalizedAddress> => {
    return request<NormalizedAddress>(
      `/addresses/${encodeURIComponent(placeId)}`,
    );
  },

  reverseGeocode: (
    latitude: number,
    longitude: number,
  ): Promise<NormalizedAddress> => {
    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
    });
    return request<NormalizedAddress>(
      `/addresses/reverse?${params.toString()}`,
    );
  },
};
