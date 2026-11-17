import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { listConnections, providers } from '../../features/connections/api/connections'
import { categories, categoryNames, createRule, listRules, updateRule, type Category } from '../../features/rules/api/rules'
import { RequestState } from '../../shared/ui/RequestState'
import { errorMessage } from '../../shared/ui/errorMessage'

export function RuleEditorPage() {
  const [params] = useSearchParams()
  const { ruleId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const connections = useQuery({ queryKey: ['connections'], queryFn: listConnections })
  const connection = connections.data?.find((item) => String(item.id) === params.get('connectionId'))
  const rules = useQuery({ queryKey: ['rules', connection?.id], queryFn: () => listRules(connection!.id), enabled: !!connection && !!ruleId })
  const existing = rules.data?.find((rule) => String(rule.id) === ruleId)
  const [emoji, setEmoji] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const save = useMutation({ mutationFn: (input: { emoji: string; category: Category }) => ruleId ? updateRule(connection!.id, Number(ruleId), input) : createRule(connection!.id, input), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['rules', connection?.id] }); navigate(`/rules?connectionId=${connection?.id}`) } })

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const value = (emoji ?? existing?.emoji ?? '').trim()
    if (!value) { setError('이모지를 입력해 주세요.'); return }
    save.mutate({ emoji: value, category: category ?? existing?.category ?? 'DECISION' }, { onError: (cause) => setError(errorMessage(cause)) })
  }

  return <RequestState loading={connections.isPending || (!!ruleId && rules.isPending)} error={connections.error || rules.error} retry={() => { void connections.refetch(); void rules.refetch() }}>
    {!connection || (ruleId && !existing) ? <div className="card empty-card"><div><h2>규칙을 찾을 수 없어요</h2><Link to="/rules">규칙 목록으로</Link></div></div> : <>
      <div className="page-head"><div className="copy"><p className="eyebrow">{ruleId ? 'EDIT RULE' : 'NEW RULE'}</p><h1 className="title">이모지 규칙 {ruleId ? '수정' : '추가'}</h1><p className="subtitle">{providers[connection.provider].name}에서 누를 이모지와 저장할 분류를 연결해 주세요.</p></div></div>
      <form className="card form-card" onSubmit={submit}><label className="field-label" htmlFor="custom-emoji">이모지</label><input className="text-input" id="custom-emoji" value={emoji ?? existing?.emoji ?? ''} onChange={(event) => setEmoji(event.target.value)} maxLength={120} autoComplete="off" placeholder={connection.provider === 'DISCORD' ? '✅ 또는 custom:123456789' : 'white_check_mark'} /><p className="field-help">{connection.provider === 'DISCORD' ? 'Discord 유니코드 이모지 또는 custom:이모지ID를 입력해 주세요.' : `${providers[connection.provider].name}의 이모지 이름을 콜론 없이 입력해 주세요.`}</p><label className="field-label" htmlFor="custom-category">저장할 분류</label><select className="select-input" id="custom-category" value={category ?? existing?.category ?? 'DECISION'} onChange={(event) => setCategory(event.target.value as Category)}>{categories.map((item) => <option value={item} key={item}>{categoryNames[item]}</option>)}</select><div className="form-actions"><button className="primary" type="submit" disabled={save.isPending}>규칙 저장하기</button><Link className="secondary link-button" to={`/rules?connectionId=${connection.id}`}>취소</Link></div>{error && <p className="form-error" role="alert">{error}</p>}</form>
    </>}
  </RequestState>
}
