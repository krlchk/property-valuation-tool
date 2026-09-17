import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import type { BaseRecord } from "@refinedev/core";

import { API_URL } from "./constants";
import type { PaginatedResponse } from "@pvt/shared";

const { dataProvider: baseDataProvider, kyInstance } =
  createSimpleRestDataProvider({
    apiURL: API_URL,
  });

type ListResponse<T> = T[] | PaginatedResponse<T>;

export const dataProvider = {
  ...baseDataProvider,

  getList: async <TData extends BaseRecord = BaseRecord>(
    params: Parameters<typeof baseDataProvider.getList>[0],
  ) => {
    const response = await baseDataProvider.getList<TData>(params);

    const data = response.data as ListResponse<TData>;

    if (Array.isArray(data)) {
      return {
        ...response,
        data,
        total: data.length,
      };
    }

    return {
      ...response,
      data: data.items,
      total: data.pagination.total,
    };
  },

  getMany: async <TData extends BaseRecord = BaseRecord>(
    params: Parameters<NonNullable<typeof baseDataProvider.getMany>>[0],
  ) => {
    const response = await baseDataProvider.getMany?.<TData>(params);

    if (!response?.data) {
      return {
        data: [],
      };
    }

    const data = response.data as ListResponse<TData>;

    return {
      ...response,
      data: Array.isArray(data) ? data : data.items,
    };
  },
};

export { kyInstance };