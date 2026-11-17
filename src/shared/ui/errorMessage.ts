import { ApiError } from '../api/ApiError'

export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
