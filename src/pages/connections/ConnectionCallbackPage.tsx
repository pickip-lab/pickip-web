import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'

export function ConnectionCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = new URLSearchParams(window.location.search)
  const id = params.get('connectionId')
  const denied = params.get('error') === 'authorization_denied'
  const valid = id !== null && /^\d+$/.test(id)

  useEffect(() => {
    if (valid) {
      void queryClient.invalidateQueries({ queryKey: ['connections'] })
      navigate(`/connections/${id}`, { replace: true })
    }
  }, [id, valid, navigate, queryClient])

  return <div className="route-status" role={denied ? 'alert' : 'status'}><h1>{denied ? '플랫폼 연결을 취소했어요' : valid ? '연결을 확인하고 있어요' : '연결 결과를 확인하지 못했어요'}</h1><p>{denied ? '언제든 다시 연결할 수 있어요.' : !valid ? '연결을 다시 시작해 주세요.' : '잠시만 기다려 주세요.'}</p><Link className="primary" to="/connections">플랫폼 연결로 돌아가기</Link></div>
}
