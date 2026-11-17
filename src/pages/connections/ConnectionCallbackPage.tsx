import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'

export function ConnectionCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = new URLSearchParams(window.location.search)
  const id = params.get('connectionId')
  const valid = id !== null && /^\d+$/.test(id)

  useEffect(() => {
    if (valid) {
      void queryClient.invalidateQueries({ queryKey: ['connections'] })
      navigate(`/connections/${id}`, { replace: true })
    }
  }, [id, valid, navigate, queryClient])

  return <div className="route-status" role="status"><h1>{valid ? '연결을 확인하고 있어요' : '연결 결과를 확인하지 못했어요'}</h1><Link to="/connections">플랫폼 연결로 돌아가기</Link></div>
}
