# PICKIP Web

PICKIP 웹 클라이언트의 독립 프로젝트입니다. React, TypeScript, Vite로 시작합니다.

## 실행

Node.js 24 LTS를 사용합니다. `.nvmrc`에 버전을 표시했습니다.

```bash
npm ci
npm run dev
```

`npm run check`로 정적 검사와 프로덕션 빌드를 확인합니다. 로컬 API 주소는 `vite.config.ts`에서 `/api`를 `http://localhost:8080`으로 전달합니다. 배포 환경에도 같은 경로의 프록시를 설정해야 합니다.

## 구조

```text
src/
  app/       앱 진입점과 전역 설정
  pages/     화면 단위 구성
  shared/    여러 기능에서 함께 쓰는 UI·자산·도구
```

기능이 생기면 `src/features/<기능명>` 안에 해당 기능의 API, 상태, 화면 조각을 함께 둡니다. 아직 없는 기능의 빈 디렉터리는 만들지 않습니다. 페이지는 필요한 feature를 조합하고, feature는 다른 feature의 내부 파일을 직접 가져오지 않습니다.

현재 첫 화면은 초기 설정 확인용입니다. 디자인 원본은 `pickip-design`에 있고, 구현할 때 화면별로 옮깁니다. 웹 카카오 로그인은 백엔드가 모바일 콜백만 지원하므로 웹 전용 인증 방식이 정해진 뒤 연결합니다.
