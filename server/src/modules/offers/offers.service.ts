import { CreateOfferPayload, Offer, OfferStatusHistory, UpdateOfferPayload } from "@pvt/shared";
import { supabase } from "../../lib/supabase";

export const findAllOffers = async (): Promise<Offer[]> => {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOffer);
};

export const findOfferById = async (id: string): Promise<Offer | null> => {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapOffer(data) : null;
};

export const createOffer = async (input: CreateOfferPayload): Promise<Offer> => {
  const status = input.status || "accepted";

  const { data: offerData, error: offerError } = await supabase
    .from("offers")
    .insert({
      property_id: input.propertyId,
      user_id: input.userId,
      min_price: input.minPrice,
      max_price: input.maxPrice,
      status,
    })
    .select()
    .single();

  if (offerError) throw offerError;

  // Log initial status to history
  const { error: historyError } = await supabase
    .from("offer_status_history")
    .insert({
      offer_id: offerData.id,
      status,
    });

  if (historyError) console.error("Failed to log initial status history:", historyError);

  return mapOffer(offerData);
};

export const updateOffer = async (
  id: string,
  input: UpdateOfferPayload
): Promise<Offer | null> => {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.minPrice !== undefined) updatePayload.min_price = input.minPrice;
  if (input.maxPrice !== undefined) updatePayload.max_price = input.maxPrice;
  if (input.status !== undefined) updatePayload.status = input.status;

  const { data, error } = await supabase
    .from("offers")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (input.status !== undefined) {
    const { error: historyError } = await supabase
      .from("offer_status_history")
      .insert({
        offer_id: id,
        status: input.status,
      });

    if (historyError) console.error("Failed to log status history:", historyError);
  }

  return mapOffer(data);
};

export const deleteOffer = async (id: string): Promise<boolean> => {
  const { error, count } = await supabase
    .from("offers")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw error;
  return (count ?? 0) > 0;
};

export const getOfferHistory = async (offerId: string): Promise<OfferStatusHistory[]> => {
  const { data, error } = await supabase
    .from("offer_status_history")
    .select("*")
    .eq("offer_id", offerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOfferHistory);
};

function mapOffer(data: Record<string, any>): Offer {
  return {
    id: data.id,
    propertyId: data.property_id,
    userId: data.user_id,
    minPrice: Number(data.min_price),
    maxPrice: Number(data.max_price),
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapOfferHistory(data: Record<string, any>): OfferStatusHistory {
  return {
    id: data.id,
    offerId: data.offer_id,
    status: data.status,
    createdAt: data.created_at,
  };
}