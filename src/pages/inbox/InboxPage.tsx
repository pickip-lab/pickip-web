import { useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { providers, providerKeys } from '../../features/connections/api/connections'
import { categories, categoryNames } from '../../features/rules/api/rules'
import { listMessages, type MessageFilters } from '../../features/messages/api/messages'
import { CategoryTags, MessageDetail } from '../../features/messages/ui/MessageDetail'
import { RequestState } from '../../shared/ui/RequestState'
import pickipIcon from '../../shared/assets/pickip-icon.png'
import { Link } from 'react-router'

export function InboxPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const category = categories.find((item) => item === params.get('category'))
  const provider = providerKeys.find((item) => item === params.get('provider'))
  const filters: MessageFilters = { category, provider }
  const messages = useInfiniteQuery({
    queryKey: ['messages', category ?? 'ALL', provider ?? 'ALL'],
    queryFn: ({ pageParam }) => listMessages(filters, pageParam),
    initialPageParam: '',
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  })
  const items = messages.data?.pages.flatMap((page) => page.items) ?? []
  const selected = items.find((item) => String(item.id) === params.get('messageId')) ?? items[0]

  function updateFilter(key: 'category' | 'provider', value: string) {
    const next = new URLSearchParams(params)
    next.delete('messageId')
    if (value === 'ALL') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  function openMessage(id: number) {
    if (window.matchMedia('(max-width: 1024px)').matches) navigate(`/messages/${id}`)
    else { const next = new URLSearchParams(params); next.set('messageId', String(id)); setParams(next) }
  }

  return <>
    <div className="page-head"><div className="copy"><p className="eyebrow">YOUR SPACE</p><h1 className="title">내 보관함</h1><p className="subtitle">골라 둔 메시지를 한곳에서 다시 꺼내보세요.</p></div></div>
    <RequestState loading={messages.isPending} error={messages.isPending ? messages.error : null} retry={() => void messages.refetch()}>
      {items.length === 0 ? <div className="card empty-card"><div><div className="empty-icon"><img src={pickipIcon} alt="" /></div><h2>{category || provider ? '이 조건에 맞는 메시지가 없어요' : '아직 담긴 메시지가 없어요'}</h2><p>{category || provider ? '다른 분류나 플랫폼을 선택해 보세요.' : '메신저에서 정해 둔 이모지를 누르면 중요한 메시지가 이곳에 쌓입니다.'}</p>{category || provider ? <button type="button" className="secondary" onClick={() => setParams({})}>필터 초기화</button> : <Link className="primary" to="/rules">수집 규칙 확인하기</Link>}</div></div> : <div className="inbox-layout"><section className="card list-card"><div className="list-top"><div className="list-topline"><h2>저장한 메시지</h2><span>최근 수집 순</span></div><div className="filter-row" role="group" aria-label="카테고리 필터"><button type="button" className={`filter-chip ${!category ? 'active' : ''}`} aria-pressed={!category} onClick={() => updateFilter('category', 'ALL')}>전체</button>{categories.map((item) => <button type="button" className={`filter-chip ${category === item ? 'active' : ''}`} aria-pressed={category === item} onClick={() => updateFilter('category', item)} key={item}>{categoryNames[item]}</button>)}</div><select className="provider-filter" aria-label="플랫폼 필터" value={provider ?? 'ALL'} onChange={(event) => updateFilter('provider', event.target.value)}><option value="ALL">모든 플랫폼</option>{providerKeys.map((item) => <option key={item} value={item}>{providers[item].name}</option>)}</select></div>
        {items.map((item) => <button type="button" className={`message-row ${selected?.id === item.id ? 'selected' : ''}`} key={item.id} onClick={() => openMessage(item.id)} aria-label={`${providers[item.provider].name}, ${item.messageText.slice(0, 80)}`}><span className="source-initial">{providers[item.provider].initial}</span><span className="message-copy"><span className="message-meta"><strong>{providers[item.provider].name}</strong><span>· {item.channelName ? `#${item.channelName}` : item.channelId}</span><time dateTime={item.capturedAt}>{new Date(item.capturedAt).toLocaleDateString('ko-KR')}</time></span><span className="message-text">{item.messageText}</span><span><CategoryTags message={item} /></span></span></button>)}
        {messages.hasNextPage && <div className="load-more"><button className="secondary" type="button" disabled={messages.isFetchingNextPage} onClick={() => void messages.fetchNextPage()}>{messages.isFetchingNextPage ? '불러오는 중…' : '더 보기'}</button></div>}{messages.isFetchNextPageError && <p className="form-error load-more" role="alert">다음 메시지를 불러오지 못했어요. 다시 시도해 주세요.</p>}
      </section>{selected && <MessageDetail message={selected} />}</div>}
    </RequestState>
  </>
}
