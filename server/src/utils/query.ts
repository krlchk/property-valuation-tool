import type { Request } from "express";
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

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

export const parsePaginationParam = (value: unknown, fallback: number): number | null => {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};