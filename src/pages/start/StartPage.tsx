import pickipIcon from '../../shared/assets/pickip-icon.png'

export function StartPage() {
  return (
    <main className="start-page">
      <div className="start-content">
        <img className="brand-icon" src={pickipIcon} alt="" />
        <p className="eyebrow">Pick it, Keep it.</p>
        <h1>PICKIP</h1>
        <p className="description">중요한 메시지를 한곳에 보관하는 공간을 준비하고 있습니다.</p>
      </div>
    </main>
  )
}
