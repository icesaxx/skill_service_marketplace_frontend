import api from "@/provider/axios";
import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface QueryPayload<T = unknown> {
  endpoint: string;
  params?: T;
  queryKey?: QueryKey;
  enabled?: boolean;
  raw?: boolean;
}

export function useApiQuery<TParams = unknown, TRes = unknown>(
  { endpoint, params, queryKey, enabled, raw }: QueryPayload<TParams>,
  options?: Omit<UseQueryOptions<TRes, Error>, "queryKey" | "queryFn">
) {
  return useQuery<TRes, Error>({
    queryKey: queryKey ?? [endpoint, params],
    queryFn: async () => {
      const res = await api.get<Response<TRes> | TRes>(endpoint, {
        params,
      });
      return raw ? (res.data as TRes) : (res.data as Response<TRes>).data;
    },
    enabled,
    ...options,
  });
}
