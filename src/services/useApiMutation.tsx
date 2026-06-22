import api from "@/provider/axios"
import { useMutation, type UseMutationOptions } from "@tanstack/react-query"

export function useApiMutation<TReq = unknown, TRes = unknown>(
    options?: UseMutationOptions<ApiResponse<TRes>, Error, MutationPayload<TReq>>
  ) {
    return useMutation<ApiResponse<TRes>, Error, MutationPayload<TReq>>({
      mutationFn: async ({ endpoint, method = 'POST', body }) => {
        const response = await api.request<ApiResponse<TRes>>({
          url: endpoint,
          method,
          data: body,
        })
  
        return response.data
      },
      ...options,
    })
  }
  
