import { supabase } from "../../lib/supabase";
import {
  OfferTerm,
  CreateOfferTermsRequest,
  UpdateOfferTermsRequest,
} from "@pvt/shared";

export const getAllOfferTerms = async (): Promise<OfferTerm[]> => {
  const { data, error } = await supabase
    .from("offer_terms")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(mapToOfferTermsResponse);
};

export const getOfferTermsById = async (
  id: number,
): Promise<OfferTerm | null> => {
  const { data, error } = await supabase
    .from("offer_terms")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapToOfferTermsResponse(data);
};

export const createOfferTerms = async (
  input: CreateOfferTermsRequest,
): Promise<OfferTerm> => {
  const { data, error } = await supabase
    .from("offer_terms")
    .insert({
      price_multiplier: input.priceMultiplier,
      closing_days_min: input.closingDaysMin,
      closing_days_max: input.closingDaysMax ?? null,
      inspection_days: input.inspectionDays,
      inspection_description: input.inspectionDescription ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapToOfferTermsResponse(data);
};

export const updateOfferTerms = async (
  id: number,
  input: UpdateOfferTermsRequest,
): Promise<OfferTerm | null> => {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.priceMultiplier !== undefined) {
    updatePayload.price_multiplier = input.priceMultiplier;
  }
  if (input.closingDaysMin !== undefined) {
    updatePayload.closing_days_min = input.closingDaysMin;
  }
  if (input.closingDaysMax !== undefined) {
    updatePayload.closing_days_max = input.closingDaysMax;
  }
  if (input.inspectionDays !== undefined) {
    updatePayload.inspection_days = input.inspectionDays;
  }
  if (input.inspectionDescription !== undefined) {
    updatePayload.inspection_description = input.inspectionDescription;
  }

  const { data, error } = await supabase
    .from("offer_terms")
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

  return mapToOfferTermsResponse(data);
};

export const deleteOfferTerms = async (id: number): Promise<boolean> => {
  const { error, count } = await supabase
    .from("offer_terms")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw error;
  }

  return count !== null && count > 0;
};

function mapToOfferTermsResponse (data: Record<string, any>): OfferTerm {
  return {
    id: data.id,
    key: data.key,
    priceMultiplier: Number(data.price_multiplier),
    closingDaysMin: data.closing_days_min,
    closingDaysMax: data.closing_days_max ?? null,
    inspectionDays: data.inspection_days,
    inspectionDescription: data.inspection_description ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};