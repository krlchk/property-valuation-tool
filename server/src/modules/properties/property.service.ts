import { CreatePropertyRequest, UpdatePropertyRequest, PropertyResponse, FetchAllResponse } from "@pvt/shared";
import { supabase } from "../../lib/supabase";
import { findUserById } from "../users/users.service";

export const getAllProperties = async (
  page: number,
  limit: number,
): Promise<FetchAllResponse<PropertyResponse>> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data || []).map(mapToPropertyResponse),
    total: count ?? 0,
  };
};

export const getPropertyById = async (
  id: string,
): Promise<PropertyResponse | null> => {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapToPropertyResponse(data);
};

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
      starting_value: input.startingValue ?? 0,
      offer_terms_id: input.offerTermsId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapToPropertyResponse(data);
};

export const updateProperty = async (
  id: string,
  input: Partial<UpdatePropertyRequest>,
): Promise<PropertyResponse | null> => {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.addressLine1 !== undefined) updatePayload.address_line1 = input.addressLine1;
  if (input.city !== undefined) updatePayload.city = input.city;
  if (input.state !== undefined) updatePayload.state = input.state;
  if (input.postalCode !== undefined) updatePayload.postal_code = input.postalCode;

  if (input.latitude !== undefined) updatePayload.latitude = input.latitude;
  if (input.longitude !== undefined) updatePayload.longitude = input.longitude;
  if (input.addressProvider !== undefined) updatePayload.address_provider = input.addressProvider;
  if (input.providerPlaceId !== undefined) updatePayload.provider_place_id = input.providerPlaceId;

  if (input.squareFeet !== undefined) updatePayload.square_feet = input.squareFeet;

  if (input.startingValue !== undefined) updatePayload.starting_value = input.startingValue;
  if (input.offerTermsId !== undefined) {
    updatePayload.offer_terms_id = input.offerTermsId ?? null;
  }

  if(input.userId !== undefined) {
    if(input.userId !== null) {
      const found = await findUserById(input.userId);

      if (!found) throw new Error('User not found');
    }

    updatePayload.user_id = input.userId
  }

  const { data, error } = await supabase
    .from("properties")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapToPropertyResponse(data);
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  const { error, count } = await supabase
    .from("properties")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return count !== null && count > 0;
};

function mapToPropertyResponse (data: Record<string, any>): PropertyResponse {
  return {
    id: data.id,

    addressLine1: data.address_line1,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,

    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    addressProvider: data.address_provider ?? null,
    providerPlaceId: data.provider_place_id ?? null,

    squareFeet: data.square_feet ?? null,
    // bedrooms: data.bedrooms ?? null,
    // bathrooms: data.bathrooms ?? null,

    startingValue: data.starting_value ?? null,

    offerTermsId: data.offer_terms_id ?? null,
    status: data.status,

    userId: data.user_id,

    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
