# boolint.com 홈페이지

## 프로젝트 개요
- boolint.com 개발자 홈페이지 (앱 목록 + 앱별 소개/도움말)
- 배포: GitHub(`boolint-kim/boolint-homepage`) → Cloudflare Pages 자동 배포
- 도메인: boolint.com / www.boolint.com (Cloudflare DNS 관리)

## 앱 목록 (총 8개)

| slug | 이름 | 설명 | 도움말 |
|------|------|------|--------|
| weather-korea | Weather Korea | 한국 날씨 | - |
| weather-taiwan | Weather Taiwan | 대만 날씨 | - |
| weather-norway | Weather Norway | 노르웨이 날씨 | - |
| capital-gains-tax | 양도세 | 양도소득세 계산 | - |
| official-price | 아파트 공시가격 | 아파트 공시가격 조회 | - |
| brokerage | 중개보수 | 부동산 중개보수 계산 | - |
| acquisition-tax | 취득세 | 부동산 취득세 계산 | - |
| agemap | AgeMap | 나이 계산기 | ✅ 6개 항목 |

## 기술 스택
- SSG: Eleventy (11ty) v3
- 템플릿: Nunjucks (.njk)
- CSS: 순수 CSS (CSS Custom Properties)
- 빌드 출력: `_site/` (순수 HTML)
- Node.js 20+ 필요

## 코딩 규칙
- JavaScript/CSS 들여쓰기: 2 spaces
- Nunjucks 템플릿 들여쓰기: 2 spaces
- 코드 주석: 한국어
- 한국어로 답변

## 다국어
- 루트(`/`): 한국어 (기본)
- `/en/`: 영어
- UI 문자열: `src/_data/i18n.json`에서 관리
- 페이지 front matter에 `lang: ko` 또는 `lang: en` 지정

## URL 구조
```
/                              → 개발자 홈 (앱 목록 카드) - 한국어
/en/                           → 개발자 홈 - 영어

# AgeMap (소개 + 도움말 6개)
/agemap/                       → AgeMap 소개
/agemap/help/                  → 도움말 목차
/agemap/help/agemap-view/      → 나이맵 사용법
/agemap/help/groups/           → 그룹 관리
/agemap/help/family-tree/      → 가계도
/agemap/help/birthday-alarm/   → 생일 알림
/agemap/help/moments/          → 기념일 기록
/agemap/help/backup/           → 백업/복원

# Weather 앱들 (간단한 소개 페이지)
/weather-korea/                → Weather Korea 소개
/weather-taiwan/               → Weather Taiwan 소개
/weather-norway/               → Weather Norway 소개

# 부동산 앱들 (간단한 소개 페이지)
/capital-gains-tax/            → 양도세 소개
/official-price/               → 아파트 공시가격 소개
/brokerage/                    → 중개보수 소개
/acquisition-tax/              → 취득세 소개

# 영어 페이지 (동일 구조)
/en/agemap/                    → AgeMap intro
/en/agemap/help/               → Help index
/en/agemap/help/agemap-view/   → Using the Age Map
/en/agemap/help/groups/        → Group Management
/en/agemap/help/family-tree/   → Family Tree
/en/agemap/help/birthday-alarm/ → Birthday Reminders
/en/agemap/help/moments/       → Moments
/en/agemap/help/backup/        → Backup & Restore
/en/weather-korea/             → Weather Korea
... (각 앱 동일 패턴)
```

## 디렉토리 구조
```
homepage/
├── .eleventy.js                 # 11ty 설정
├── wrangler.toml                # Cloudflare Pages 빌드 설정
├── package.json
├── .gitignore
├── public/                      # 빌드 없이 그대로 복사
│   ├── _headers
│   ├── _redirects
│   ├── app-ads.txt              # AdMob app-ads.txt
│   └── robots.txt
├── src/
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk        # HTML 뼈대 (head, body, SEO)
│   │   │   └── app.njk         # 앱 페이지 레이아웃 (사이드바)
│   │   ├── header.njk          # 공통 헤더 (네비게이션, 언어 전환)
│   │   ├── footer.njk          # 공통 푸터
│   │   └── app-card.njk        # 앱 카드 컴포넌트 (아이콘 이미지 or placeholder)
│   ├── _data/
│   │   ├── site.json           # 사이트 메타 정보
│   │   ├── apps.json           # 앱 목록 데이터 (iconReady: true면 아이콘 표시)
│   │   └── i18n.json           # 다국어 UI 문자열
│   ├── assets/
│   │   ├── css/
│   │   │   ├── global.css      # 리셋, CSS 변수, 타이포
│   │   │   └── components.css  # 카드, 버튼, 사이드바, 스크린샷
│   │   └── images/
│   │       └── agemap/         # AgeMap 이미지
│   │           ├── icon.png              # 앱 아이콘 (카드용)
│   │           ├── feature-banner.png    # 소개 페이지 배너
│   │           ├── screenshot-groups.png # 나이맵+그룹 패널
│   │           ├── screenshot-family-tree.png
│   │           ├── screenshot-birthday.png
│   │           ├── screenshot-person-detail.png
│   │           └── screenshot-moments.png
│   ├── index.njk               # / (한국어 홈)
│   ├── 404.njk
│   ├── agemap/                  # AgeMap (소개 + 도움말)
│   │   ├── index.njk
│   │   └── help/
│   │       ├── index.njk       # 도움말 목차
│   │       ├── agemap-view.njk # 나이맵 사용법
│   │       ├── groups.njk      # 그룹 관리
│   │       ├── family-tree.njk # 가계도
│   │       ├── birthday-alarm.njk # 생일 알림
│   │       ├── moments.njk     # 기념일 기록
│   │       └── backup.njk      # 백업/복원
│   ├── weather-korea/
│   │   └── index.njk
│   ├── weather-taiwan/
│   │   └── index.njk
│   ├── weather-norway/
│   │   └── index.njk
│   ├── capital-gains-tax/
│   │   └── index.njk
│   ├── official-price/
│   │   └── index.njk
│   ├── brokerage/
│   │   └── index.njk
│   ├── acquisition-tax/
│   │   └── index.njk
│   └── en/                      # 영어 페이지 (동일 구조)
│       ├── index.njk
│       ├── agemap/
│       │   ├── index.njk
│       │   └── help/
│       │       ├── index.njk
│       │       ├── agemap-view.njk
│       │       ├── groups.njk
│       │       ├── family-tree.njk
│       │       ├── birthday-alarm.njk
│       │       ├── moments.njk
│       │       └── backup.njk
│       ├── weather-korea/
│       │   └── index.njk
│       ... (각 앱 동일 패턴)
```

## 레이아웃 계층
- `base.njk` → 모든 페이지의 HTML 뼈대
  - `app.njk` → 앱 페이지 (base 상속, 사이드바 추가)

## CSS 전략
- CSS Custom Properties로 테마 변수 관리
- 파일 2개: `global.css` (변수, 리셋, 타이포) + `components.css` (컴포넌트)
- 모바일 퍼스트, 브레이크포인트: 768px, 1024px
- 폰트: Pretendard (한국어), system-ui 폴백
- 이미지: `.app-banner` (배너), `.app-screenshot` (스크린샷 max-width: 320px)
- 프레임워크 없음

## Cloudflare Pages 배포 설정
- Build command: `npx @11ty/eleventy`
- Output directory: `_site`
- 환경변수: `NODE_VERSION=20`
- GitHub 리포: `boolint-kim/boolint-homepage`

## 도메인 현황

| 도메인 | 상태 | 설명 |
|--------|------|------|
| boolint.com | ✅ Cloudflare Pages | 홈페이지 (메인) |
| www.boolint.com | ✅ Cloudflare Pages | → boolint.com 301 리다이렉트 |
| campx.boolint.com | ✅ Cloudflare 프록시 | CCTV 프록시 (az2 Azure, Node.js + PM2) |
| agemap-api.boolint-kim.workers.dev | ✅ Cloudflare Workers + KV | AgeMap API |
| apps.boolint.com | ❌ 폐기 예정 | Google Sites → DNS 삭제 필요 |

## 검증
- 로컬: `npm run dev` → localhost:8080
- 빌드: `npm run build` → `_site/` 확인 (33개 HTML, 0.08초)
- 배포: git push → Cloudflare Pages 자동 배포

## 남은 작업
- apps.boolint.com DNS CNAME 삭제 + Google Sites 삭제
- NCP nginx 설정에서 boolint.com/www 서버 블록 제거

## 완료된 작업
- ✅ 개인정보처리방침 페이지 추가 (한글/영문 각 1페이지)
