import type { Request } from "express";

export function getIdFromParam(req: Request): { id: string };
export function getIdFromParam(req: Request, parseAsNumber: true): { id: number };
export function getIdFromParam(
  req: Request,
  parseAsNumber = false
): { id: string | number } {
  const rawId = req.params.id;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;

  if (parseAsNumber) {
    const parsedId = Number(idStr);
    return { id: isNaN(parsedId) ? 0 : parsedId };
  }

  return { id: idStr ?? "" };
}