import { CreateUserPayload, UpdateUserPayload, User, FetchAllResponse } from "@pvt/shared";
import { supabase } from "../../lib/supabase";


export const getAllUsers = async (
  page: number,
  limit: number,
): Promise<FetchAllResponse<User>> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: (data || []).map(mapUser),
    total: count ?? 0,
  };
};

export const findUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data ? mapUser(data) : null;
};

export const upsertUser = async (
  input: CreateUserPayload & { id?: string }
): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        ...(input.id ? { id: input.id } : {}),
        name: input.name,
        email: input.email,
        mobile_number: input.mobileNumber,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" } // Resolves conflict if a user with the same email exists
    )
    .select()
    .single();

  if (error) throw error;

  return mapUser(data);
};

export const updateUser = async (
  id: string,
  input: UpdateUserPayload
): Promise<User> => {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.email !== undefined) {
    updatePayload.email = input.email;
  }

  if (input.name !== undefined) {
    updatePayload.name = input.name;
  }

  if (input.mobileNumber !== undefined) {
    updatePayload.mobile_number = input.mobileNumber;
  }

  const { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return mapUser(data);
};

export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) throw error;
};

function mapUser(data: Record<string, any>): User {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    mobileNumber: data.mobile_number,
  };
}