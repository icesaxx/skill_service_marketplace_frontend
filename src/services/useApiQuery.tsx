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
}

export function useApiQuery<TParams = unknown, TRes = unknown>(
  { endpoint, params, queryKey, enabled }: QueryPayload<TParams>,
  options?: UseQueryOptions<TRes, Error>
) {
  return useQuery<TRes, Error>({
    queryKey: queryKey ?? [endpoint, params],
    queryFn: async () => {
      const res = await api.get<Response<TRes>>(endpoint, {
        params,
      });
      return res.data.data;
    },
    enabled,
    ...options,
  });
}
