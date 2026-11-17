import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { deleteMessage, getMessage } from '../../features/messages/api/messages'
import { MessageDetail } from '../../features/messages/ui/MessageDetail'
import { RequestState } from '../../shared/ui/RequestState'
import { errorMessage } from '../../shared/ui/errorMessage'

export function MessagePage() {
  const { id } = useParams()
  const messageId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const message = useQuery({ queryKey: ['message', messageId], queryFn: () => getMessage(messageId), enabled: Number.isSafeInteger(messageId) && messageId > 0 })
  const remove = useMutation({ mutationFn: () => deleteMessage(messageId), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['messages'] }); queryClient.removeQueries({ queryKey: ['message', messageId] }); navigate('/inbox', { replace: true }) } })

  if (!Number.isSafeInteger(messageId) || messageId <= 0) return <div className="card empty-card"><Link to="/inbox">보관함으로 돌아가기</Link></div>
  return <>
    <div className="page-head"><div><Link className="back-link" to="/inbox">보관함으로</Link><p className="eyebrow">PICKED MESSAGE</p><h1 className="title">메시지 상세</h1></div></div>
    <RequestState loading={message.isPending} error={message.error} retry={() => void message.refetch()}>{message.data && <MessageDetail message={message.data} full onDelete={() => setConfirmDelete(true)} />}</RequestState>
    {confirmDelete && <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">이 메시지를 삭제할까요?</h2><p>PICKIP 보관함에서 삭제됩니다. 원본 플랫폼의 메시지는 유지돼요.</p>{remove.error && <p className="form-error" role="alert">{errorMessage(remove.error)}</p>}<div className="modal-actions"><button className="secondary" type="button" onClick={() => setConfirmDelete(false)}>취소</button><button className="primary" type="button" disabled={remove.isPending} onClick={() => remove.mutate()}>삭제</button></div></div></div>}
  </>
}
