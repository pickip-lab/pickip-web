# PICKIP Web

PICKIP 웹 클라이언트의 독립 프로젝트입니다. React, TypeScript, Vite로 시작합니다.

## 실행

Node.js 24 LTS를 사용합니다. `.nvmrc`에 버전을 표시했습니다.

```bash
npm ci
npm run dev
```

`npm run check`로 lint, 화면 테스트, TypeScript 검사와 프로덕션 빌드를 확인합니다. 로컬 API 주소는 `vite.config.ts`에서 `/api`를 `http://localhost:8080`으로 전달합니다. 배포 환경에도 같은 경로의 프록시를 설정해야 합니다.

## 구조

```text
src/
  app/       앱 진입점과 전역 설정
  pages/     화면 단위 구성
  shared/    여러 기능에서 함께 쓰는 UI·자산·도구
```

기능이 생기면 `src/features/<기능명>` 안에 해당 기능의 API, 상태, 화면 조각을 함께 둡니다. 아직 없는 기능의 빈 디렉터리는 만들지 않습니다. 페이지는 필요한 feature를 조합하고, feature는 다른 feature의 내부 파일을 직접 가져오지 않습니다.

디자인 원본은 `pickip-design`에 있습니다. 로그인·플랫폼 연결·수집 규칙·보관함은 백엔드 API에 연결되어 있습니다. 인증과 연결 설정은 [docs/integration.md](docs/integration.md)에서 관리합니다.
