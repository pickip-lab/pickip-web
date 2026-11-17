import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { listConnections, providers } from '../../features/connections/api/connections'
import { categories, categoryNames, createRule, deleteRule, displayEmojis, listRules, presetEmoji, type Category, type Rule } from '../../features/rules/api/rules'
import { RequestState } from '../../shared/ui/RequestState'
import { errorMessage } from '../../shared/ui/errorMessage'

export function RulesPage() {
  const [params, setParams] = useSearchParams()
  const queryClient = useQueryClient()
  const connections = useQuery({ queryKey: ['connections'], queryFn: listConnections })
  const available = connections.data ?? []
  const selected = available.find((item) => String(item.id) === params.get('connectionId')) ?? available[0]
  const rules = useQuery({ queryKey: ['rules', selected?.id], queryFn: () => listRules(selected!.id), enabled: !!selected })
  const [error, setError] = useState('')
  const create = useMutation({ mutationFn: (input: { emoji: string; category: Category }) => createRule(selected!.id, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules', selected?.id] }) })
  const remove = useMutation({ mutationFn: (id: number) => deleteRule(selected!.id, id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules', selected?.id] }) })

  async function toggle(category: Category, existing?: Rule) {
    if (!selected) return
    setError('')
    try {
      if (existing) await remove.mutateAsync(existing.id)
      else await create.mutateAsync({ emoji: presetEmoji(selected.provider, category), category })
    } catch (cause) { setError(errorMessage(cause)) }
  }

  return <>
    <div className="page-head"><div className="copy"><p className="eyebrow">REACTION RULES</p><h1 className="title">수집 규칙</h1><p className="subtitle">정한 이모지를 메시지에 누르면 해당 분류로 저장해요.</p></div>{selected && <Link className="primary" to={`/rules/new?connectionId=${selected.id}`}>＋ 이모지 직접 추가</Link>}</div>
    <RequestState loading={connections.isPending} error={connections.error} retry={() => void connections.refetch()}>
      {!selected ? <div className="card empty-card"><div><h2>먼저 플랫폼을 연결해 주세요</h2><p>연결된 플랫폼별로 이모지 규칙을 만들 수 있어요.</p><Link className="primary" to="/connections">플랫폼 연결하기</Link></div></div> :
        <div className="rules-layout"><section className="card rules-main"><label className="field-label" htmlFor="rule-connection">적용할 연결</label><select className="select-input" id="rule-connection" value={selected.id} onChange={(event) => { setError(''); setParams({ connectionId: event.target.value }) }}>{available.map((item) => <option value={item.id} key={item.id}>{providers[item.provider].name} · {item.workspaceName}{item.status === 'DISCONNECTED' ? ' (해제됨)' : ''}</option>)}</select>
          {selected.status === 'DISCONNECTED' && <p className="field-help">연결이 해제된 공간이에요. 규칙은 유지되지만 새 메시지는 수집되지 않습니다.</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <RequestState loading={rules.isPending} error={rules.error} retry={() => void rules.refetch()}><div className="rules-intro"><h2>추천 규칙</h2><span className="small muted">이모지별 규칙을 추가하거나 삭제할 수 있어요</span></div><div className="preset-grid">{categories.map((category) => {
            const emoji = presetEmoji(selected.provider, category)
            const existing = rules.data?.find((rule) => rule.emoji === emoji)
            return <div className="preset-card" key={category}><span className="preset-emoji">{displayEmojis[category]}</span><div><strong>{existing ? categoryNames[existing.category] : categoryNames[category]}</strong><small>{emoji}</small></div>{existing && <Link className="preset-edit" to={`/rules/${existing.id}/edit?connectionId=${selected.id}`}>수정</Link>}<button className={existing ? 'added' : ''} type="button" disabled={create.isPending || remove.isPending} onClick={() => void toggle(category, existing)} aria-pressed={!!existing}>{existing ? '삭제' : '추가'}</button></div>
          })}</div>
            {rules.data?.some((rule) => !categories.some((item) => rule.emoji === presetEmoji(selected.provider, item))) && <><div className="rules-intro"><h2>직접 추가한 규칙</h2></div>{rules.data.filter((rule) => !categories.some((item) => rule.emoji === presetEmoji(selected.provider, item))).map((rule) => <div className="custom-rule-row" key={rule.id}><span><strong>{rule.emoji}</strong><small>분류: {categoryNames[rule.category]}</small></span><span><Link to={`/rules/${rule.id}/edit?connectionId=${selected.id}`}>수정</Link><button type="button" disabled={remove.isPending} onClick={() => void toggle(rule.category, rule)}>삭제</button></span></div>)}</>}
          </RequestState>
        </section><aside className="card rules-side"><h3>어떻게 저장되나요?</h3><p>규칙을 만든 뒤 메신저에서 이모지를 누르면 해당 메시지 한 건만 PICKIP으로 가져옵니다.</p><div className="mini-step"><b>01</b> 연결한 플랫폼에서 이모지 선택</div><div className="mini-step"><b>02</b> 메시지 본문을 보관함에 저장</div><div className="mini-step"><b>03</b> 정한 분류로 다시 찾기</div><p>규칙 변경은 새로 누르는 이모지부터 적용됩니다.</p></aside></div>}
    </RequestState>
  </>
}
