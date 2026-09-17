import type {
  CreateOfferTermsRequest,
  OfferTerm,
  UpdateOfferTermsRequest,
} from "@pvt/shared";
import { request } from "./api";

export const offerTermsService = {
  getAll: (): Promise<OfferTerm[]> => {
    return request<OfferTerm[]>("/offer-terms");
  },

  getById: (id: number): Promise<OfferTerm> => {
    return request<OfferTerm>(`/offer-terms/${id}`);
  },

  create: (input: CreateOfferTermsRequest): Promise<OfferTerm> => {
    return request<OfferTerm>("/offer-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  update: (
    id: number,
    input: Partial<UpdateOfferTermsRequest>,
  ): Promise<OfferTerm> => {
    return request<OfferTerm>(`/offer-terms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  delete: (id: number): Promise<void> => {
    return request<void>(`/offer-terms/${id}`, {
      method: "DELETE",
    });
  },
};
