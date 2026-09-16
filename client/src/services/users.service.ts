import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@pvt/shared";
import { request } from "./api";

type UpsertUserPayload = CreateUserPayload & {
  id?: string;
};

const upsert = (input: UpsertUserPayload): Promise<User> => {
  return request<User>("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
};

export const usersService = {
  getById: (id: string): Promise<User> => {
    return request<User>(`/users/${encodeURIComponent(id)}`);
  },

  upsert,

  // The server's create endpoint is an upsert keyed by email.
  create: upsert,

  update: (id: string, input: UpdateUserPayload): Promise<User> => {
    return request<User>(`/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  delete: (id: string): Promise<void> => {
    return request<void>(`/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
