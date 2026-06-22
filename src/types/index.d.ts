declare global {
    interface ApiResponse<T> {
        success?: boolean | string
        isSuccess: boolean
        message: string
        data?: T
        token?: string
        user?: T extends { user?: infer U } ? U : unknown
        statusCode: number
        errors: string[]
    }

    type NoRequest = Record<string, never>
    type NoResponse = Record<string, never>

    type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

    interface MutationPayload<TReq> {
        endpoint: string
        method?: HttpMethod
        body?: TReq
    }

}

export {}
