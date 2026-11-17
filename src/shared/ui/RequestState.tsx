import type { ReactNode } from 'react'
import { errorMessage } from './errorMessage'

export function RequestState({ loading, error, retry, children }: {
  loading: boolean; error: unknown; retry: () => void; children: ReactNode
}) {
  if (loading) return <div className="card empty-card" role="status">불러오는 중이에요.</div>
  if (error) return <div className="card empty-card" role="alert"><div><h2>불러오지 못했어요</h2><p>{errorMessage(error)}</p><button className="secondary" type="button" onClick={retry}>다시 시도</button></div></div>
  return children
}
