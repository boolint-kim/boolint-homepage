# boolint.com 홈페이지

## ⏩ 현재 상태 (2026-10-15 — v2 재설계 완료, 미배포)

- **v2 재설계 Phase 0~4 완료** — 모든 페이지가 `layouts/v2.njk` 계열이다. 브랜치 **`redesign`**, **main 병합·배포는 사용자 결정 대기**(Cloudflare Pages 는 main 을 본다).
- 설계·결정·함정의 정본은 **`docs/REDESIGN_V2_SPEC.md`** (§3 클래스 카탈로그, §5 앱 페이지 규격·매크로 계약, §9 한 쪽 이전 체크리스트, §11 함정, §13 결정 로그).
- **새 앱 페이지를 만들 때**는 `src/satpic/index.njk` 를 복사해 매크로에 내용만 채운다. 계산 사례는 `m.case`, 스크린샷 없는 앱은 `src/apttradechart/index.njk`, 원고 없는 앱은 stub(`src/finedustmap/index.njk`).

## 프로젝트 개요
- boolint.com 개발자 홈페이지 (앱 목록 + 앱별 소개/도움말)
- 배포: GitHub(`boolint-kim/boolint-homepage`) → Cloudflare Pages 자동 배포
- 도메인: boolint.com / www.boolint.com (Cloudflare DNS 관리)

## 앱 노출 정책

쇼츠 → 홈페이지 진입을 가정한 첫인상 집중 전략. **노출 23개(ko 22 + 영문 전용 1) + hidden 15개 = 38개**.

### 카테고리 (4개)

| 키 | 한국 홈 | 영어 홈 | 노출 수 (ko / en) |
|---|---|---|---|
| `weather-road` | 날씨·도로 라이브 | Weather & Road Live | 6 / 7 |
| `realestate` | 부동산·세금 | (영어 홈 제외) | 11 / 0 |
| `daily-tool` | 일상 도구·만들기 | Daily Tools & Maker | 3 / 3 |
| `learning` | 학습·교양 | Learning & Knowledge | 2 / 2 |

### 노출 앱 (apps.json 배열 순서 = 홈 표시 순서)

**weather-road**: satpic, camlocation, myweather, weathertw, **weatherus**(영어 홈만), myweathertw, finedustmap
**realestate** (11): mysalary, transtax, acqtax, gifttax, propertytax, junsewolse, realestatecal, seoullife, busanlife, apttradechart, officetradechart
**daily-tool** (3): agemap, snapatlas, iconmixer
**learning** (2): universedaily, englishnumber

- **weatherus(Weather Radar USA)는 영문 전용 앱** — 한국어 페이지가 없어 `showInKorean: false` 로 한국 홈에서만 뺐다(hidden 이 아니다. hidden 은 영어 홈까지 막는다).

### Featured 섹션

- 한국 홈 (6): satpic, camlocation, transtax, propertytax, seoullife, universedaily — 2026-10-15 weathertw(한국어 UI 없음) 대신 universedaily 로 교체. weathertw 는 영어 홈 featuredEn 만 유지
- 영어 홈 (5): satpic, camlocation, weathertw, weatherus, universedaily — 2열 그리드라 마지막 1개가 홀로 남는 3행 구조
- featured 앱은 자기 카테고리 섹션에도 그대로 표시 (중복 노출 OK).

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

## apps.json 플래그

| 필드 | 타입 | 의미 |
|---|---|---|
| `category` | string | weather-road / realestate / daily-tool / learning |
| `koreaOnly` | boolean | 데이터·시장이 한국 한정인지 (메타데이터, 노출과 무관) |
| `showInEnglish` | boolean | 영어 홈 노출 여부. 미지정 시 `!koreaOnly` (즉 `koreaOnly:true`면 기본 숨김, 명시로 강제 노출 가능). 필터: `.eleventy.js`의 `inEnglishHome` |
| `showInKorean` | boolean | 한국 홈 노출 여부. 미지정 시 노출. 영문 전용 앱(한국어 페이지 없음)만 `false`. 필터: `.eleventy.js`의 `inKoreanHome` |
| `featured` | boolean | 한국 홈 featured 섹션 노출 |
| `featuredEn` | boolean | 영어 홈 featured 섹션 노출 (featured와 독립) |
| `hidden` | boolean | 홈페이지 전체 미노출 (카테고리·featured 모두 제외) |

## URL 구조

각 노출 앱마다 `/{slug}/` 한국어 페이지가 있고, 영어 홈에 노출되는 12개는 `/en/{slug}/`도 있음. weatherus 는 영문 전용이라 `/en/weatherus/` 만 있다. AgeMap만 도움말(`/agemap/help/...`) 7페이지 추가.

```
/                              → 한국어 홈
/en/                           → 영어 홈

# 노출 앱별 페이지 (slug = apps.json의 slug)
/{slug}/                       → 한국어 소개 (22개, weatherus 제외)
/en/{slug}/                    → 영어 소개 (12개, 영어 홈 노출 앱만)

# AgeMap 도움말 (한·영 동일 구조)
/agemap/help/                  → 도움말 목차
/agemap/help/agemap-view/      → 나이맵 사용법
/agemap/help/groups/           → 그룹 관리
/agemap/help/family-tree/      → 가계도
/agemap/help/birthday-alarm/   → 생일 알림
/agemap/help/moments/          → 기념일 기록
/agemap/help/backup/           → 백업/복원

# 기타
/privacy/, /en/privacy/        → 개인정보처리방침
/404.html                      → 404
/sitemap.xml                   → 사이트맵
```

### 랜딩 페이지 깊이
- **풀랜딩**(히어로 + 숫자 띠 + 기능 행 3~5 + 접힌 전체 기능 + 신뢰 + CTA): satpic, camlocation, myweather, agemap, snapatlas, universedaily, acqtax, officetradechart, weathertw, weatherus, propertytax, realestatecal, transtax, seoullife, busanlife, junsewolse, englishnumber, mysalary, gifttax, iconmixer
- **글 전용**(스크린샷 없음 — plain 히어로 + 3단 카드): apttradechart, aptrentchart(hidden)
- **stub**(plain 히어로 + CTA): myweathertw, finedustmap, weatherno(hidden). 원고가 생기면 풀랜딩으로.

## 디렉토리 구조
```
homepage/
├── .eleventy.js                 # 11ty 설정 + 필터: inEnglishHome/inKoreanHome · bySlug · visibleIn · inCategory
├── public/                      # 빌드 없이 그대로 복사 (_headers, _redirects, app-ads.txt, robots.txt)
├── docs/REDESIGN_V2_SPEC.md     # v2 설계 정본
├── src/
│   ├── _includes/
│   │   ├── layouts/v2.njk       # 모든 페이지의 뼈대 (pageCss·pageJs·bodyClass 지원)
│   │   ├── layouts/v2-doc.njk   # 문서형 — 왼쪽 목차 + 본문 (AgeMap 도움말)
│   │   └── v2/
│   │       ├── header.njk, footer.njk   # 문자열은 i18n.json (nav.* / footer.*)
│   │       ├── home.njk                 # 홈 본문 ko/en 공용 (페이지는 copy 문구만 set)
│   │       └── macros.njk               # 앱 페이지 매크로 + tile·appItem·icon·badges·case
│   ├── _data/
│   │   ├── site.json, i18n.json (ko·en·es·cs)
│   │   ├── apps.json            # 앱 목록 — 홈 대표 타일은 tile 필드(tint·shot·w·h)
│   │   └── agemapHelp.json      # 도움말 목차 (ko/en)
│   ├── assets/
│   │   ├── css/v2.css           # 디자인 시스템 전체 (+ trend.css 는 /trend/ 전용)
│   │   ├── images/badges/       # 스토어 공식 배지
│   │   └── images/{slug}/       # 아이콘(PNG 512) · 스크린샷(WebP 720폭)
│   ├── index.njk, en/index.njk  # 홈
│   ├── {slug}/index.njk, en/{slug}/index.njk   # 앱 소개
│   ├── agemap/help/, en/agemap/help/           # 도움말 7×2 (v2-doc)
│   ├── privacy/, en/ es/ cs/privacy/           # 개인정보처리방침 4판 (.prose)
│   ├── trend/                   # 동작하는 웹앱 (trend.css/js)
│   └── 404.njk, sitemap.njk
```

## 레이아웃 계층
- `v2.njk` → 모든 페이지의 HTML 뼈대 (헤더·푸터 include)
  - `v2-doc.njk` → 문서형 (v2 상속, 왼쪽 목차)
- 앱 페이지는 레이아웃이 아니라 **매크로**(`v2/macros.njk`)로 구성한다

## CSS 전략
- `v2.css` 한 파일. 토큰은 `:root` 한 곳, 모바일 퍼스트, 브레이크포인트 640 / 900 / 1100
- 폰트: Pretendard Variable (jsdelivr CDN, 동적 서브셋)
- 클래스 카탈로그는 구현서 §3. 스크린샷은 베젤이 박혀 있어 CSS 프레임 없이 `drop-shadow` 만
- CSS 를 고치면 `v2.njk` 의 `?v=` 를 올린다 (캐시 1시간, immutable 금지)
- 프레임워크 없음, JS 없음 (/trend/ 만 예외)

## Cloudflare Pages 배포 설정
- Build command: `npx @11ty/eleventy`
- Output directory: `_site`
- 환경변수: `NODE_VERSION=20`
- GitHub 리포: `boolint-kim/boolint-homepage`

### 캐시 주의사항
- `public/_headers`에서 `/assets/*` 캐시 정책 관리
- 고정 파일명(예: `components.css`)에 `immutable` 캐시 절대 사용 금지 → CSS/JS 변경이 반영되지 않음
- `immutable`은 파일명에 해시가 포함된 경우(예: `app.a3f2b1.css`)에만 사용
- 현재 설정: `max-age=3600` (1시간)

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
- 빌드: `npm run build` → `_site/` 확인 (60개 파일, ~0.3초). ⚠️ `_site/` 는 지운 파일이 남으므로 링크 검사는 `--output=<새 폴더>` 로 깨끗하게 빌드해서 할 것
- 배포: git push → Cloudflare Pages 자동 배포

## 남은 작업
- apps.boolint.com DNS CNAME 삭제 + Google Sites 삭제
- NCP nginx 설정에서 boolint.com/www 서버 블록 제거

## Git
- git push 허용

## 완료된 작업
- ✅ 2026-10-15 v2 전면 재설계 (redesign 브랜치) — 홈·모든 앱 소개·도움말·privacy·404·/trend/ 가 v2, 옛 레이아웃·CSS 삭제. 정본 `docs/REDESIGN_V2_SPEC.md`
- ✅ 2026-10-01 체코어 개인정보처리방침 추가 — `/cs/privacy/`. es 와 같은 구조(한 페이지뿐인 로케일, 홈 링크는 영어 홈,
  `i18n.json` 의 `cs` 는 7개 키만). WeatherCz(Radar srážek) 출처 시트가 직접 링크한다. 번역은 Claude — 원어민 검토 전.
  ⚠️ 이제 **ko·en·es·cs 네 판**이 같은 방침이다. **한 판만 고치지 말 것**
- ✅ 2026-09-12 스페인어 개인정보처리방침 추가 — `/es/privacy/` 한 페이지뿐인 로케일.
  WeatherEs(El tiempo Radar) 앱이 법적 고지에서 직접 링크로 들어오는 자리다.
  스페인어 홈은 없어서 `header.njk` 의 prefix 가 es 를 **영어 홈**으로 보내고,
  `i18n.json` 의 `es` 는 템플릿이 실제로 쓰는 **7개 키만** 있다
  (스페인어 페이지를 더 만들면 키를 채울 것 — 없는 키는 조용히 빈 문자열로 렌더된다).
  ⚠️ ko·en·es 세 판은 같은 방침이다. **한 판만 고치지 말 것**
- ✅ 개인정보처리방침 페이지 추가 (한글/영문 각 1페이지)
- ✅ 2026-09-01 WeatherUs(Weather Radar USA) 영문 전용 랜딩 추가 — `/en/weatherus/`, 영어 홈 카테고리+featuredEn 노출, `showInKorean` 플래그 신설
- ✅ 2026-05-21 홈 재구조: 8개 → 21개 앱 노출, 4개 카테고리(weather-road / realestate / daily-tool / learning), featured/featuredEn boolean 분리, showInEnglish 기본값 규칙 (RESTRUCTURE_SPEC.md 참조)
