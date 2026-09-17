import type {
  CreateOfferPayload,
  Offer,
  OfferStatusHistory,
  UpdateOfferPayload,
} from "@pvt/shared";
import { request } from "./api";

export const offersService = {
  getAll: (): Promise<Offer[]> => {
    return request<Offer[]>("/offers");
  },

  getById: (id: string): Promise<Offer> => {
    return request<Offer>(`/offers/${encodeURIComponent(id)}`);
  },

  create: (input: CreateOfferPayload): Promise<Offer> => {
    return request<Offer>("/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  update: (id: string, input: UpdateOfferPayload): Promise<Offer> => {
    return request<Offer>(`/offers/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  delete: (id: string): Promise<void> => {
    return request<void>(`/offers/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  getHistory: (id: string): Promise<OfferStatusHistory[]> => {
    return request<OfferStatusHistory[]>(
      `/offers/${encodeURIComponent(id)}/history`,
    );
  },
};
