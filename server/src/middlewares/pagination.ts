import { Request, Response, NextFunction } from "express";

type PaginationOptions = {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
};

const getPaginationParams = (req: Request, options: PaginationOptions) => {
  const { defaultPage = 1, defaultLimit = 10, maxLimit = 100 } = options;

  let page = defaultPage;
  let limit = defaultLimit;

  const { page: qPage, limit: qLimit, _start, _end } = req.query;

  if (_start !== undefined && _end !== undefined) {
    const start = Number(_start);
    const end = Number(_end);

    if (!isNaN(start) && !isNaN(end) && end > start) {
      limit = end - start;
      page = Math.floor(start / limit) + 1;
    }
  } else {
    if (qPage) {
      const parsedPage = Number(qPage);
      if (!isNaN(parsedPage) && parsedPage > 0) page = parsedPage;
    }
    if (qLimit) {
      const parsedLimit = Number(qLimit);
      if (!isNaN(parsedLimit) && parsedLimit > 0) limit = parsedLimit;
    }
  }

  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const applyPagination = (options: {} = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.pagination = getPaginationParams(req, options);
    next();
  };
};
