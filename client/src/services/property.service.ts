import type {
  CreatePropertyRequest,
  PropertyResponse,
  UpdatePropertyRequest,
} from "@pvt/shared";
import { request } from "./api";


export const propertyService = {
  create: (input: CreatePropertyRequest): Promise<PropertyResponse> => {
    return request<PropertyResponse>("/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  getById: (id: string): Promise<PropertyResponse> => {
    return request<PropertyResponse>(`/properties/${encodeURIComponent(id)}`);
  },

  estimatePrice: (id: string): Promise<{ estimatedPrice: number }> => {
    return request(`/properties/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id),
    });
  },

  update: (id: string, input: Partial<UpdatePropertyRequest>): Promise<PropertyResponse> => {
    return request<PropertyResponse>(`/properties/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  delete: (id: string): Promise<void> => {
    return request<void>(`/properties/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};