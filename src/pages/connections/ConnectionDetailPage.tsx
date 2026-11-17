import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { beginConnection, disconnectConnection, listConnections, providers } from '../../features/connections/api/connections'
import { RequestState } from '../../shared/ui/RequestState'
import { errorMessage } from '../../shared/ui/errorMessage'

export function ConnectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const connections = useQuery({ queryKey: ['connections'], queryFn: listConnections })
  const connection = connections.data?.find((item) => String(item.id) === id)
  const [error, setError] = useState('')
  const disconnect = useMutation({ mutationFn: () => disconnectConnection(connection!.id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['connections'] }); navigate('/connections') } })

  async function reconnect() {
    if (!connection) return
    setError('')
    try {
      const { authorizationUrl } = await beginConnection(connection.provider)
      const url = new URL(authorizationUrl)
      if (url.protocol !== 'https:') throw new Error('Unexpected authorization URL')
      window.location.assign(url.href)
    } catch (cause) { setError(errorMessage(cause)) }
  }

  return <RequestState loading={connections.isPending} error={connections.error} retry={() => void connections.refetch()}>
    {!connection ? <div className="card empty-card"><div><h1>연결을 찾을 수 없어요</h1><Link to="/connections">목록으로 돌아가기</Link></div></div> : <>
      <div className="page-head"><div className="copy"><p className="eyebrow">CONNECTION</p><h1 className="title">{providers[connection.provider].name} 연결 상세</h1><p className="subtitle">이 공간의 연결 상태와 수집 준비를 확인하세요.</p></div><Link className="secondary link-button" to="/connections">목록으로</Link></div>
      <div className="detail-layout"><section className="card connection-detail-card"><div className="connection-title"><span className="platform-icon">{providers[connection.provider].initial}</span><div><h2>{providers[connection.provider].name} · {connection.workspaceName}</h2><p>내 계정으로 연결</p></div></div>
        <div className={`state-box ${connection.status === 'ERROR' ? 'error' : ''}`}><strong><span className="status-dot" />{connection.status === 'CONNECTED' ? '정상 연결' : connection.status === 'ERROR' ? '재연결 필요' : '연결 해제됨'}</strong><p>{connection.status === 'CONNECTED' ? '새로 누르는 이모지의 메시지를 수집할 준비가 됐어요.' : connection.status === 'ERROR' ? `새 메시지 수집이 멈췄어요. 다시 연결해 주세요. (${connection.errorCode ?? '연결 오류'})` : '새 메시지는 수집하지 않습니다. 이미 저장한 메시지는 보관함에 남아 있어요.'}</p></div>
        <dl className="facts"><dt>플랫폼</dt><dd>{providers[connection.provider].name}</dd><dt>공간</dt><dd>{connection.workspaceName}</dd><dt>연결 시각</dt><dd>{new Date(connection.connectedAt).toLocaleString('ko-KR')}</dd></dl>
      </section><aside className="card detail-side"><h3>다음 단계</h3><p>{connection.status === 'CONNECTED' ? '수집 규칙을 정한 뒤 메신저에서 이모지를 누르면 보관함에 메시지가 쌓여요.' : '연결을 다시 완료하면 새 메시지 수집을 이어갈 수 있어요.'}</p>
        {connection.status === 'CONNECTED' ? <Link className="primary" to={`/rules?connectionId=${connection.id}`}>수집 규칙 보기 →</Link> : <button className="primary" type="button" onClick={() => void reconnect()}>다시 연결하기 →</button>}
        {connection.status !== 'DISCONNECTED' && <button className="text-button danger-text" type="button" disabled={disconnect.isPending} onClick={() => { if (window.confirm(`${connection.workspaceName} 연결을 해제할까요?`)) disconnect.mutate() }}>연결 해제</button>}
        {(error || disconnect.error) && <p className="form-error" role="alert">{error || errorMessage(disconnect.error)}</p>}
      </aside></div>
    </>}
  </RequestState>
}
