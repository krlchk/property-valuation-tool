import type { Request, Response } from "express";
import {
  deleteUser,
  findUserById,
  updateUser,
  upsertUser,
} from "./users.service";
import { getIdFromParam } from "../../utils/query";

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);

    const user = await findUserById(id);
    return user
      ? res.status(200).json(user)
      : res.status(404).json({ error: "User not found" });
  } catch (error: any) {
    console.error("Failed to fetch user:", error);
    return res.status(500).json({ error: error?.message || "Failed to fetch user" });
  }
};

export const upsertUserController = async (req: Request, res: Response) => {
  try {
    const { id, name, email, mobileNumber } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required and must be a string" });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "email is required and must be a string" });
    }

    const user = await upsertUser({ id, name, email, mobileNumber });
    return res.status(200).json(user);
  } catch (error: any) {
    console.error("Failed to upsert user:", error);
    return res.status(500).json({ error: error?.message || "Failed to upsert user" });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);
    const { name, email, mobileNumber } = req.body;

    const updatedUser = await updateUser(id, { name, email, mobileNumber });
    return updatedUser
      ? res.status(200).json(updatedUser)
      : res.status(404).json({ error: "User not found" });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return res.status(500).json({ error: error?.message || "Failed to update user" });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = getIdFromParam(req);

    await deleteUser(id);
    return res.status(204).send();
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return res.status(500).json({ error: error?.message || "Failed to delete user" });
  }
};