import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { getMessage, resetCategories, updateCategories } from '../../features/messages/api/messages'
import { categories, categoryNames, type Category } from '../../features/rules/api/rules'
import { RequestState } from '../../shared/ui/RequestState'
import { errorMessage } from '../../shared/ui/errorMessage'

export function CategoryEditorPage() {
  const { id } = useParams()
  const messageId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const message = useQuery({ queryKey: ['message', messageId], queryFn: () => getMessage(messageId), enabled: Number.isSafeInteger(messageId) && messageId > 0 })
  const [chosen, setChosen] = useState<Category[] | null>(null)
  const save = useMutation({ mutationFn: (values: Category[]) => updateCategories(messageId, values), onSuccess: async (updated) => { queryClient.setQueryData(['message', messageId], updated); await queryClient.invalidateQueries({ queryKey: ['messages'] }); navigate(`/messages/${messageId}`) } })
  const reset = useMutation({ mutationFn: () => resetCategories(messageId), onSuccess: async (updated) => { queryClient.setQueryData(['message', messageId], updated); await queryClient.invalidateQueries({ queryKey: ['messages'] }); navigate(`/messages/${messageId}`) } })
  const values = chosen ?? message.data?.categories.map((item) => item.category) ?? []

  function toggle(category: Category) {
    setChosen(values.includes(category) ? values.filter((item) => item !== category) : [...values, category])
  }

  if (!Number.isSafeInteger(messageId) || messageId <= 0) return <div className="card empty-card"><Link to="/inbox">보관함으로 돌아가기</Link></div>
  return <>
    <div className="page-head"><div className="copy"><p className="eyebrow">ORGANIZE</p><h1 className="title">분류 바꾸기</h1><p className="subtitle">필요한 분류를 여러 개 선택할 수 있어요. 모두 해제해도 메시지는 보관함에 남습니다.</p></div></div>
    <RequestState loading={message.isPending} error={message.error} retry={() => void message.refetch()}><section className="card form-card"><div className="check-list">{categories.map((category) => <label className="check-row" key={category}><input type="checkbox" checked={values.includes(category)} onChange={() => toggle(category)} />{categoryNames[category]}</label>)}</div><div className="form-actions"><button className="primary" type="button" disabled={save.isPending || reset.isPending} onClick={() => save.mutate(values)}>저장하기</button><Link className="secondary link-button" to={`/messages/${messageId}`}>취소</Link>{message.data?.categoriesCustomized && <button className="text-button" type="button" disabled={save.isPending || reset.isPending} onClick={() => reset.mutate()}>원래 분류로 되돌리기</button>}</div>{(save.error || reset.error) && <p className="form-error" role="alert">{errorMessage(save.error || reset.error)}</p>}</section></RequestState>
  </>
}
