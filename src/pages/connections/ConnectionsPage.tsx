import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { beginConnection, listConnections, providerKeys, providers, type Provider } from '../../features/connections/api/connections'
import { RequestState } from '../../shared/ui/RequestState'
import { errorMessage } from '../../shared/ui/errorMessage'

export function ConnectionsPage() {
  const navigate = useNavigate()
  const connections = useQuery({ queryKey: ['connections'], queryFn: listConnections })
  const [busy, setBusy] = useState<Provider | null>(null)
  const [error, setError] = useState('')

  async function connect(provider: Provider) {
    setBusy(provider)
    setError('')
    try {
      const result = await beginConnection(provider)
      const url = new URL(result.authorizationUrl)
      if (url.protocol !== 'https:') throw new Error('Unexpected authorization URL')
      window.location.assign(url.href)
    } catch (cause) {
      setError(errorMessage(cause))
      setBusy(null)
    }
  }

  return <>
    <div className="page-head"><div className="copy"><p className="eyebrow">CONNECT</p><h1 className="title">플랫폼 연결</h1><p className="subtitle">중요한 대화가 있는 곳을 연결해 주세요. 연결한 계정의 메시지만 골라 담을 수 있어요.</p></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <RequestState loading={connections.isPending} error={connections.error} retry={() => void connections.refetch()}>
      <div className="connection-grid">
        {providerKeys.map((provider) => {
          const info = providers[provider]
          const items = connections.data?.filter((item) => item.provider === provider) ?? []
          const active = items.filter((item) => item.status !== 'DISCONNECTED')
          return <article className="card connection-card" key={provider}>
            <div className="connection-top"><span className="platform-icon">{info.initial}</span>{active.length > 0 && <span className="status">{active.length}개 연결</span>}</div>
            <h2>{info.name}</h2><p>{active.length ? active.map((item) => item.workspaceName).join(', ') : info.description}</p>
            <button className="secondary" type="button" disabled={busy !== null} onClick={() => void connect(provider)}>{busy === provider ? '이동 중…' : `${info.name} 연결하기`}</button>
            {items.length > 0 && <div className="connection-links">{items.map((item) => <button key={item.id} type="button" onClick={() => navigate(`/connections/${item.id}`)}>{item.workspaceName} <span>{item.status === 'CONNECTED' ? '연결됨' : item.status === 'ERROR' ? '확인 필요' : '해제됨'} ›</span></button>)}</div>}
          </article>
        })}
      </div>
      <div className="info-panel"><strong>메시지는 언제 저장되나요?</strong><p>연결 후 정한 이모지를 직접 누른 메시지만 보관함에 들어옵니다. 연결을 해제해도 이미 저장된 메시지는 유지됩니다.</p></div>
      {connections.data?.length === 0 && <p className="small muted">연결을 마치면 <Link to="/rules">수집 규칙</Link>을 만들어 주세요.</p>}
    </RequestState>
  </>
}
