import { Fragment } from 'react'
import { Link } from 'react-router'
import { providers } from '../../connections/api/connections'
import { categoryNames } from '../../rules/api/rules'
import { safeExternalUrl, type CapturedMessage } from '../api/messages'

export function CategoryTags({ message }: { message: CapturedMessage }) {
  return message.categories.length ? message.categories.map(({ category }) => <span className="tag" key={category}>{categoryNames[category]}</span>) : <span className="small muted">분류 없음</span>
}

export function MessageFacts({ message }: { message: CapturedMessage }) {
  const rows = [
    ['플랫폼', providers[message.provider].name],
    ['공간', message.workspaceName || message.workspaceId],
    ['채널', message.channelName ? `#${message.channelName}` : message.channelId],
    ['작성자', message.authorName || '확인할 수 없음'],
    ['작성 시각', new Date(message.messageCreatedAt).toLocaleString('ko-KR')],
    ['수집 시각', new Date(message.capturedAt).toLocaleString('ko-KR')],
  ]
  return <dl className="facts">{rows.map(([label, value]) => <Fragment key={label}><dt>{label}</dt><dd>{value}</dd></Fragment>)}</dl>
}

export function MessageDetail({ message, full = false, onDelete }: { message: CapturedMessage; full?: boolean; onDelete?: () => void }) {
  const permalink = safeExternalUrl(message.permalink)
  return <article className={`card ${full ? 'reading' : 'detail-card'}`}>
    {!full && <div className="detail-card-head">메시지 상세</div>}
    <div className="detail-card-body"><span className="detail-kicker">{providers[message.provider].name.toUpperCase()} · {message.channelName ? `#${message.channelName}` : message.channelId}</span><h2>{message.messageText.split('\n')[0] || '내용 없는 메시지'}</h2><p className="detail-message">{message.messageText}</p><div className="divider" />
      <div className="detail-section"><div className="section-line"><p className="section-label">분류</p><Link className="text-button" to={`/messages/${message.id}/categories`}>수정</Link></div><CategoryTags message={message} />{message.categoriesCustomized && <p className="small muted">직접 수정한 분류예요.</p>}</div>
      <div className="detail-section"><p className="section-label">출처와 기록</p><MessageFacts message={message} /></div>
      {full && message.captureTriggers.length > 0 && <div className="detail-section"><p className="section-label">수집한 이모지</p><p className="small muted">{message.captureTriggers.map((item) => item.triggerEmoji).filter(Boolean).join(', ')}</p></div>}
    </div>
    <div className={full ? 'reading-actions' : 'detail-card-foot'}>{!full && <Link className="primary" to={`/messages/${message.id}`}>상세 전체 보기</Link>}{permalink ? <a className={full ? 'primary' : 'text-button'} href={permalink} target="_blank" rel="noopener noreferrer">원본에서 보기 ↗</a> : <small>원본 링크를 제공하지 않는 메시지예요.</small>}{full && onDelete && <button type="button" className="text-button danger-text" onClick={onDelete}>삭제</button>}</div>
  </article>
}
