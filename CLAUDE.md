# boolint.com 홈페이지

## 프로젝트 개요
- boolint.com 개발자 홈페이지 (앱 목록 + 앱별 소개/도움말)
- 배포: GitHub(`boolint-kim/boolint-homepage`) → Cloudflare Pages 자동 배포
- 도메인: boolint.com / www.boolint.com (Cloudflare DNS 관리)

## 앱 노출 정책

쇼츠 → 홈페이지 진입을 가정한 첫인상 집중 전략. **노출 21개 + hidden 15개 = 36개**.

### 카테고리 (4개)

| 키 | 한국 홈 | 영어 홈 | 노출 수 (ko / en) |
|---|---|---|---|
| `weather-road` | 날씨·도로 라이브 | Weather & Road Live | 6 / 6 |
| `realestate` | 부동산·세금 | (영어 홈 제외) | 10 / 0 |
| `daily-tool` | 일상 도구·만들기 | Daily Tools & Maker | 3 / 3 |
| `learning` | 학습·교양 | Learning & Knowledge | 2 / 2 |

### 노출 앱 21개 (apps.json 배열 순서 = 홈 표시 순서)

**weather-road** (6): satpic, camlocation, myweather, weathertw, myweathertw, finedustmap
**realestate** (10): transtax, acqtax, gifttax, propertytax, junsewolse, realestatecal, seoullife, busanlife, apttradechart, officetradechart
**daily-tool** (3): agemap, snapatlas, iconmixer
**learning** (2): universedaily, englishnumber

### Featured 섹션

- 한국 홈 (6, 2×3): satpic, camlocation, transtax, weathertw, propertytax, seoullife
- 영어 홈 (4, 2×2): satpic, camlocation, weathertw, universedaily
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
| `featured` | boolean | 한국 홈 featured 섹션 노출 |
| `featuredEn` | boolean | 영어 홈 featured 섹션 노출 (featured와 독립) |
| `hidden` | boolean | 홈페이지 전체 미노출 (카테고리·featured 모두 제외) |

## URL 구조

각 노출 앱마다 `/{slug}/` 한국어 페이지가 있고, 영어 홈에 노출되는 11개는 `/en/{slug}/`도 있음. AgeMap만 도움말(`/agemap/help/...`) 7페이지 추가.

```
/                              → 한국어 홈
/en/                           → 영어 홈

# 노출 앱별 페이지 (slug = apps.json의 slug)
/{slug}/                       → 한국어 소개 (21개)
/en/{slug}/                    → 영어 소개 (11개, 영어 홈 노출 앱만)

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
- **풀랜딩**: satpic, camlocation, myweather, agemap, snapatlas, universedaily, acqtax, officetradechart, apttradechart, weathertw, weatherno, propertytax, realestatecal, transtax, seoullife (히어로 + 다단 섹션 + 스크린샷)
- **stub**: gifttax, junsewolse, busanlife, myweathertw, finedustmap, iconmixer, englishnumber (이름 + 한 줄 + Play Store 링크). 추후 풀랜딩으로 확장 예정.

## 디렉토리 구조
```
homepage/
├── .eleventy.js                 # 11ty 설정 + inEnglishHome 필터
├── wrangler.toml
├── package.json
├── public/                      # 빌드 없이 그대로 복사
│   ├── _headers, _redirects, app-ads.txt, robots.txt
├── src/
│   ├── _includes/
│   │   ├── layouts/{base,app}.njk
│   │   ├── header.njk, footer.njk
│   │   └── app-card.njk        # 홈 카드 (preview 이미지 or 첫글자 placeholder)
│   ├── _data/
│   │   ├── site.json
│   │   ├── apps.json           # 36개 앱 (노출 21 + hidden 15)
│   │   └── i18n.json
│   ├── assets/
│   │   ├── css/{global,components}.css
│   │   └── images/{slug}/      # 앱별 아이콘·배너·스크린샷
│   ├── index.njk               # 한국어 홈 (featured + 4 카테고리)
│   ├── en/index.njk            # 영어 홈 (featuredEn + 3 카테고리, realestate 제외)
│   ├── 404.njk, sitemap.njk
│   ├── privacy/                # 개인정보처리방침 (ko)
│   ├── {slug}/index.njk        # 노출 21개 한국어 페이지
│   └── en/
│       ├── privacy/
│       └── {slug}/index.njk    # 영어 노출 11개 페이지
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
- 빌드: `npm run build` → `_site/` 확인 (55개 파일, ~0.2초)
- 배포: git push → Cloudflare Pages 자동 배포

## 남은 작업
- apps.boolint.com DNS CNAME 삭제 + Google Sites 삭제
- NCP nginx 설정에서 boolint.com/www 서버 블록 제거

## Git
- git push 허용

## 완료된 작업
- ✅ 개인정보처리방침 페이지 추가 (한글/영문 각 1페이지)
- ✅ 2026-05-21 홈 재구조: 8개 → 21개 앱 노출, 4개 카테고리(weather-road / realestate / daily-tool / learning), featured/featuredEn boolean 분리, showInEnglish 기본값 규칙 (RESTRUCTURE_SPEC.md 참조)
