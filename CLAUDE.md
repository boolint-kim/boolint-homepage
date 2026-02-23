# boolint.com 홈페이지

## 프로젝트 개요
- boolint.com 개발자 홈페이지 (앱 목록 + 앱별 소개/도움말)
- apps.boolint.com (Google Sites) 콘텐츠를 새로 작성하여 이전
- 배포: GitHub → Cloudflare Pages 자동 배포
- 도메인: boolint.com (Cloudflare DNS 관리)

## 앱 목록 (총 8개, 그룹핑 없이 플랫 나열)

| slug | 이름 | 설명 |
|------|------|------|
| weather-korea | Weather Korea | 한국 날씨 |
| weather-taiwan | Weather Taiwan | 대만 날씨 |
| weather-norway | Weather Norway | 노르웨이 날씨 |
| capital-gains-tax | 양도세 | 양도소득세 계산 |
| official-price | 아파트 공시가격 | 아파트 공시가격 조회 |
| brokerage | 중개보수 | 부동산 중개보수 계산 |
| acquisition-tax | 취득세 | 부동산 취득세 계산 |
| agemap | AgeMap | 나이 계산기 |

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
/                              → 개발자 홈 (앱 목록 카드, 플랫 나열) - 한국어
/en/                           → 개발자 홈 - 영어

# AgeMap (소개 + 도움말)
/agemap/                       → AgeMap 소개
/agemap/help/                  → 도움말 목차
/agemap/help/backup/           → 백업/복원 안내

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
/en/agemap/help/               → Help
/en/agemap/help/backup/        → Backup guide
/en/weather-korea/             → Weather Korea
... (각 앱 동일 패턴)
```

## 디렉토리 구조
```
homepage/
├── .eleventy.js                 # 11ty 설정
├── package.json
├── .gitignore
├── public/                      # 빌드 없이 그대로 복사
│   ├── _headers
│   ├── _redirects
│   └── robots.txt
├── src/
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk        # HTML 뼈대 (head, body, SEO)
│   │   │   └── app.njk         # 앱 페이지 레이아웃 (사이드바)
│   │   ├── header.njk          # 공통 헤더 (네비게이션, 언어 전환)
│   │   ├── footer.njk          # 공통 푸터
│   │   └── app-card.njk        # 앱 카드 컴포넌트
│   ├── _data/
│   │   ├── site.json           # 사이트 메타 정보
│   │   ├── apps.json           # 앱 목록 데이터 (플랫 배열)
│   │   └── i18n.json           # 다국어 UI 문자열
│   ├── assets/
│   │   ├── css/
│   │   │   ├── global.css      # 리셋, CSS 변수, 타이포
│   │   │   └── components.css  # 카드, 버튼, 사이드바
│   │   └── images/
│   ├── index.njk               # / (한국어 홈)
│   ├── 404.njk
│   ├── agemap/                  # AgeMap (소개 + 도움말)
│   │   ├── index.njk
│   │   └── help/
│   │       ├── index.njk
│   │       └── backup.njk
│   ├── weather-korea/           # Weather 앱들 (간단 소개)
│   │   └── index.njk
│   ├── weather-taiwan/
│   │   └── index.njk
│   ├── weather-norway/
│   │   └── index.njk
│   ├── capital-gains-tax/       # 부동산 앱들 (간단 소개)
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
│       │       └── backup.njk
│       ├── weather-korea/
│       │   └── index.njk
│       ├── weather-taiwan/
│       │   └── index.njk
│       ├── weather-norway/
│       │   └── index.njk
│       ├── capital-gains-tax/
│       │   └── index.njk
│       ├── official-price/
│       │   └── index.njk
│       ├── brokerage/
│       │   └── index.njk
│       └── acquisition-tax/
│           └── index.njk
```

## 레이아웃 계층
- `base.njk` → 모든 페이지의 HTML 뼈대
  - `app.njk` → 앱 페이지 (base 상속, 사이드바 추가)

## CSS 전략
- CSS Custom Properties로 테마 변수 관리
- 파일 2개: `global.css` (변수, 리셋, 타이포) + `components.css` (컴포넌트)
- 모바일 퍼스트, 브레이크포인트: 768px, 1024px
- 폰트: Pretendard (한국어), system-ui 폴백
- 프레임워크 없음

## Cloudflare Pages 배포 설정
- Build command: `npx @11ty/eleventy`
- Output directory: `_site`
- 환경변수: `NODE_VERSION=20`
- GitHub 리포: `boolint-kim/boolint-homepage`

## 기존 도메인 현황 및 영향 분석

### boolint.com / www.boolint.com → 대체
- 서버: NCP (115.85.180.241), nginx/1.14.0 Ubuntu
- 내용: Bootstrap placeholder 페이지 (실질적 콘텐츠 없음)
- 조치: Cloudflare Pages로 **완전 대체**. DNS A 레코드 → Pages CNAME으로 변경

### apps.boolint.com → 폐기
- 서버: Google Sites (CNAME → ghs.googlehosted.com)
- 내용: "App Box" - Weather(Korea/Taiwan/Norway), 부동산(양도세/공시가격/중개보수/취득세)
- 마지막 업데이트: 2023년 7월 (2년 이상 방치)
- 조치: 새 홈페이지에 앱 콘텐츠를 새로 작성. DNS CNAME 레코드 삭제, Google Sites 삭제

### campx.boolint.com → 유지 (영향 없음)
- 서버: Cloudflare 프록시 (172.67.149.125 / 104.21.47.177) → az2 Azure 서버
- 내용: CCTV 프록시 서버 (Node.js + PM2)
- 조치: DNS 레코드 그대로 유지

### agemap-api.boolint-kim.workers.dev → 유지 (영향 없음)
- 서버: Cloudflare Workers + KV
- 내용: AgeMap API
- 조치: 별도 도메인이라 완전히 독립

## DNS 변경 계획
| 레코드 | 현재 | 변경 후 |
|--------|------|---------|
| boolint.com (A) | 115.85.180.241 (NCP) | Cloudflare Pages CNAME |
| www.boolint.com | 115.85.180.241 (NCP) | boolint.com 301 리다이렉트 |
| apps.boolint.com (CNAME) | ghs.googlehosted.com | DNS 레코드 삭제 |
| campx.boolint.com | Cloudflare 프록시 | 변경 없음 |

## 구현 순서
1. 프로젝트 초기화 (npm init, 11ty 설치, .eleventy.js, .gitignore)
2. 데이터 파일 (site.json, apps.json 플랫 배열, i18n.json)
3. 레이아웃 & 공통 컴포넌트 (base.njk, app.njk, header, footer, app-card)
4. CSS (global.css, components.css)
5. 홈 페이지 (앱 카드 플랫 그리드, 404)
6. AgeMap 페이지 (소개/도움말)
7. Weather 앱 3개 + 부동산 앱 4개 간단 소개 페이지
8. 영어 페이지 (en/ 하위 동일 구조)
9. 배포 설정 (_headers, _redirects, robots.txt)
10. Git & Cloudflare Pages 배포
11. 배포 확인 후 apps.boolint.com DNS 삭제, Google Sites 삭제
※ 개인정보처리방침은 배포 완료 후 별도 추가 (앱별이 아닌 한글/영문 각 1페이지)

## 검증
- 로컬: `npm run dev` → localhost:8080
- 빌드: `npm run build` → `_site/` 확인
- 배포 후: boolint.com 접속, HTTPS, 기존 서비스 영향 없음 확인
