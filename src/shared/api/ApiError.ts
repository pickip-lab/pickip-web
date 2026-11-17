export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(
    status: number,
    code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function errorFromResponse(response: Response): Promise<ApiError> {
  try {
    const body: unknown = await response.json()
    if (body && typeof body === 'object' && 'code' in body && 'message' in body) {
      const { code, message } = body
      if (typeof code === 'string' && typeof message === 'string') {
        return new ApiError(response.status, code, message)
      }
    }
  } catch {
    // The server may return an empty or non-JSON error body.
  }
  return new ApiError(response.status, 'HTTP_ERROR', '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
}
