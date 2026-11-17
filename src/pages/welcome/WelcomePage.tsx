import { Link } from 'react-router'
import pickipIcon from '../../shared/assets/pickip-icon.png'
import { Brand } from '../../shared/ui/Brand'

export function WelcomePage() {
  return (
    <main className="welcome-layout">
      <header className="welcome-head"><Brand /></header>
      <div className="welcome-center">
        <img className="logo-large" src={pickipIcon} alt="" />
        <p className="eyebrow">WELCOME TO PICKIP</p>
        <h1>이제 메시지를 골라 담아볼까요?</h1>
        <p>세 단계면 시작할 수 있어요.</p>
        <div className="welcome-steps">
          <div className="welcome-step"><small>01</small><strong>플랫폼 연결</strong><span>대화가 있는 곳을 연결해요</span></div>
          <div className="welcome-step"><small>02</small><strong>수집 규칙 만들기</strong><span>이모지와 분류를 정해요</span></div>
          <div className="welcome-step"><small>03</small><strong>메시지 골라 담기</strong><span>메신저에서 이모지를 눌러요</span></div>
        </div>
        <Link className="primary" to="/connections">플랫폼 연결하기 →</Link>
      </div>
    </main>
  )
}
