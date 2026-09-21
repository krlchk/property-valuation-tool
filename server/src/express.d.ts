import { PaginationParams } from "./utils/query";

declare global {
  namespace Express {
    interface Request {
      pagination: PaginationParams;
    }
  }
}
