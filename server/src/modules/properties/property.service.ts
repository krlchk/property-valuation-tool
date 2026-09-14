import { CreatePropertyRequest, PropertyResponse } from "@pvt/shared";
import { supabase } from "../../lib/supabase";

export const createProperty = async (
  input: CreatePropertyRequest,
): Promise<PropertyResponse> => {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      address_line1: input.addressLine1,
      city: input.city,
      state: input.state,
      postal_code: input.postalCode,

      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      address_provider: input.addressProvider ?? null,
      provider_place_id: input.providerPlaceId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return {
    id: data.id,

    addressLine1: data.address_line1,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,

    latitude: data.latitude,
    longitude: data.longitude,
    addressProvider: data.address_provider,
    providerPlaceId: data.provider_place_id,

    squareFeet: data.square_feet,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,

    startingValue: data.starting_value,
    startingValueSource: data.starting_value_source,

    timeline: data.timeline,
    status: data.status,

    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
