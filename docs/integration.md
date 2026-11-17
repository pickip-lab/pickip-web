# 웹 인증과 API 연결

## 로컬 설정

백엔드와 웹을 각각 실행합니다. 웹 개발 서버는 `/api`를 `http://localhost:8080`으로 전달합니다. 브라우저는 `http://localhost:5173`으로 접속해야 합니다. 백엔드의 기본 설정은 아래와 같습니다.

```text
WEB_ORIGIN=http://localhost:5173
WEB_REDIRECT_URI=http://localhost:5173/auth/callback
PLATFORM_WEB_REDIRECT_URI=http://localhost:5173/connections/callback
```

카카오 개발자 콘솔에는 백엔드의 `KAKAO_REDIRECT_URI`를 등록합니다. Slack 등 플랫폼 개발자 콘솔에는 백엔드의 플랫폼 callback 주소를 등록합니다. Slack은 공개 HTTPS callback 주소가 필요합니다. 각 제공자의 실제 Client ID·Secret 등을 백엔드 환경변수로 설정해야 OAuth 연결을 완료할 수 있습니다. 자세한 백엔드 설정은 `pickip-backend/docs/authentication`과 `pickip-backend/docs/platform-connection`을 참고합니다.

배포 환경은 웹과 API를 같은 출처로 제공하고 `/api`를 백엔드에 전달해야 합니다. `WEB_ORIGIN`, `WEB_REDIRECT_URI`, `PLATFORM_WEB_REDIRECT_URI`, `WEB_REFRESH_COOKIE_SECURE`를 운영 주소에 맞게 설정합니다. HTTPS에서는 refresh cookie를 Secure로 유지합니다.

## 인증 흐름

1. 카카오 로그인 버튼에서 PKCE verifier와 challenge를 만들고 서버의 OAuth 시작 주소로 이동합니다.
2. 카카오 로그인 후 웹 `/auth/callback`에서 일회용 코드를 웹 세션 API로 교환합니다.
3. 액세스 토큰은 메모리에만 보관합니다. refresh token은 서버가 `HttpOnly; SameSite=Strict` 쿠키로 관리합니다.
4. 새로고침하면 refresh API로 액세스 토큰을 복구합니다. 401 응답은 한 번 갱신 후 재요청합니다.
5. 로그아웃하면 서버에서 refresh token을 폐기하고 클라이언트 데이터를 비웁니다.

## API 화면

| 화면 | 주요 API |
|---|---|
| 플랫폼 연결 | `GET /api/v1/platform-connections`, `POST /api/v1/platform-connections/{provider}/web/authorize`, `DELETE /api/v1/platform-connections/{id}` |
| 수집 규칙 | `GET/POST /api/v1/platform-connections/{id}/reaction-rules`, `PUT/DELETE /api/v1/platform-connections/{id}/reaction-rules/{ruleId}` |
| 보관함 | `GET /api/v1/messages`, `GET/DELETE /api/v1/messages/{id}`, `PUT/DELETE /api/v1/messages/{id}/categories` |

메시지 목록은 백엔드의 cursor를 그대로 사용하고 같은 필터로 다음 페이지를 요청합니다. `npm run check`로 UI 요청 흐름, 정적 검사, 빌드를 검증합니다.
