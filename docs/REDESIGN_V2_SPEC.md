# boolint.com v2 재설계 구현서

작성 2026-10-15 (Claude Fable, 시안 세션). 실행은 다음 세션의 Claude(Opus) 가 한다.
이 문서가 **정본**이다. 여기 없는 결정이 필요해지면 임의로 정하지 말고 사용자에게 묻는다.

---

## 0. 지금 상태 한 눈에

| 항목 | 값 |
|---|---|
| 브랜치 | `redesign` (main 에서 분기. 시안은 커밋 `3a89ed2`) |
| 진행 | **Phase 0~4 완료(2026-10-15)** — 모든 페이지가 v2. 옛 레이아웃·CSS 삭제. **남은 것: main 병합·배포(사용자 결정)와 데스크톱·모바일 최종 확인(사용자)** |
| 시안이 건드리지 않은 것 | 기존 페이지 전부. 옛 `base.njk`·`global.css`·`components.css` 는 그대로 살아 있다 |
| 사용자 확인 | 2026-10-15 Phase 0 에서 사용자가 브라우저로 두 시안 확인 → **변경 없이 OK** |

### 사용자가 확정한 결정 4가지 (2026-10-15) — 재질문 금지

1. **톤**: 밝은 본문 + **진한 네이비 히어로/CTA 면**. 전체 다크 아님.
2. **범위**: 홈 + 앱 페이지 템플릿 둘 다. 대표 앱부터 옮기고 나머지는 묶음으로.
3. **진행**: 시안을 브라우저에서 확인하고 확정한 뒤 본 구현.
4. **앱 페이지 깊이**: **핵심 기능 3~5개 블록** + 하단 `<details>` 에 접힌 "모든 기능" 목록(검색 유입용 본문 보존). 내용을 과감히 지우지 않고, 배치만 바꾸지도 않는다.

---

## 1. 목표와 원칙

**문제**: 현재 홈은 글자 히어로 + 같은 카드 23장, 앱 페이지는 760px 한 칼럼에 소제목·문단·불릿·스크린샷을 10~14번 반복한다. 매뉴얼 구조라 "소개"로 읽히지 않는다. Pretendard 는 이름만 있고 로드되지 않아 시스템 폰트로 나온다.

**해법**: 스택(11ty·Nunjucks·순수 CSS·Cloudflare Pages)은 유지. 바꾸는 것은 세 층 — ① 디자인 토큰·컴포넌트(`v2.css`), ② 홈 구조, ③ 앱 페이지 템플릿. **섹션을 매크로로 만들어 페이지는 내용만 채운다.** 다음 디자인 손질이 34개 파일이 아니라 매크로 한 곳에서 끝나게.

**카피 원칙**
- 소개 페이지는 *문제 → 약속 → 증거(화면) 3~5개 → 신뢰(출처·프라이버시) → 다운로드* 순서다. 기능 전수 나열은 접힌 목록으로.
- **사실은 기존 페이지(옛 `src/<slug>/index.njk`)에 적힌 것만 쓴다.** 숫자(채널 수·지역 수)는 옛 페이지 본문에서 세어 쓰고, 없는 사실을 만들지 않는다.
- 문장은 짧게. 한 블록에 문단 1개 + 체크 항목 3개. 체크 항목은 `<strong>` 으로 핵심어 하나만 강조.
- 과장 금지("최고의", "완벽한"). 기존 페이지의 톤(담백한 설명체)을 유지한다.
- 홈 카피 중 "회원가입과 로그인이 없습니다"는 모든 앱에 해당한다는 전제다. **사용자에게 Phase 0 에서 예외 여부를 한 번 확인**한다.

---

## 2. 지금 있는 것 (파일 인벤토리)

```
src/_includes/layouts/v2.njk        v2 기본 레이아웃 — Pretendard CDN + v2.css. ⚠️ pageCss/pageJs 미지원 (Phase 1 에서 추가)
src/_includes/v2/header.njk         반투명 고정 헤더. homeUrl 변수(시안 전용) 사용
src/_includes/v2/footer.njk         브랜드 + 분야 링크 + 정보. 문자열 인라인(ko/en 분기) → i18n 으로 옮길 것
src/_includes/v2/macros.njk         badges(playUrl, appStoreUrl, lang) · appItem(app, lang, prefix)
src/assets/css/v2.css               단독 스타일시트 436줄. 옛 CSS 와 독립. 클래스 카탈로그는 §3
src/assets/images/badges/           google-play-{ko,en}.png (646×250, 투명 여백 포함) · app-store-{ko,en}.svg (공식)
src/_includes/v2/home.njk           (Phase 1) 홈 본문 ko/en 공용. 페이지는 `copy` 문구 묶음만 set 하고 include
src/index.njk · src/en/index.njk    (Phase 1) v2 홈. 시안 src/v2/ 는 삭제됨
src/satpic/ · src/en/satpic/        (Phase 1) 매크로로 쓴 첫 앱 페이지 — 다음 앱의 본보기
.eleventy.js                        필터 추가됨: bySlug(apps, slug) · visibleIn(apps, lang) · inCategory(apps, cat)
src/_data/apps.json                 transtax·weathertw·junsewolse·seoullife·busanlife 에 iconReady:true 추가(아이콘 파일이 이미 있었음)
```

두 시안 페이지는 `eleventyExcludeFromCollections: true` 로 사이트맵에서 빠져 있다. `permalink` 로 `/v2/…` 에 고정.

---

## 3. 디자인 시스템 — `v2.css` 클래스 카탈로그

토큰은 `:root` 한 곳. 브레이크포인트 **640 / 900 / 1100**. 모바일 퍼스트. JS 없음.

| 용도 | 클래스 | 메모 |
|---|---|---|
| 컨테이너 | `.wrap` | max 1152px, 좌우 `clamp(16px,4vw,32px)` |
| 섹션 | `.section` `.section--soft` | 세로 `clamp(64px,9vw,120px)`. soft = 연회색 바탕 |
| 섹션 머리 | `.section__head` (+`--center`) `.eyebrow` `.lead` `.section__row` `.link-more` | eyebrow 는 앞에 짧은 선이 붙는 소제목 |
| 다크 면 | `.dark` | 네이비 그라데이션 + 격자. 히어로·CTA 에 섞어 쓴다 (`class="hero dark"`) |
| 버튼 | `.btn` + `--primary` `--light` `--ghost` `--outline`, `.btn__arrow` | 다크 면에선 light+ghost 조합 |
| 스토어 배지 | `.badges` `.badge--play` `.badge--appstore` | 매크로 `m.badges()` 만 쓴다. Play PNG 는 52px, Apple SVG 는 44px (시각 높이를 맞춘 값) |
| 헤더/푸터 | `.header*` `.footer*` | 레이아웃이 include 한다. 페이지가 건드리지 않음 |
| 홈 히어로 | `.hero` `.hero__grid` `.hero__title` `.hero__lead` `.hero__actions` `.hero__stats` `.stat__num/label` `.pill` | |
| 폰 팬 | `.hero__visual` `.phones` `.phone--c/--l/--r` | 폰 폭 상한 200/160px, 비주얼 높이 84vw(≥900: 560px) |
| 대표 앱 벤토 | `.bento` `.tile` `.tile--large` `.tile--{navy,sky,mint,amber,sand,rose,violet}` `.tile__head/icon/cat/name/desc/cta/shot` | ≥1100: 4열, large 는 2칸. 스크린샷은 타일 바닥에서 올라와 잘린다 |
| 전체 앱 | `.chips` `.chip` `.cat` `.cat__head/title/count/desc` `.app-list` `.app-item*` `[data-cat]` | 아이콘 없으면 `.app-item__icon--ph` 첫 글자, 바탕은 카테고리 틴트 |
| 3단 카드 | `.cards3` `.card` `.card__icon` `.card__vs` | 만드는 방식·비교·신뢰 모두 이 한 벌 |
| 앱 히어로 | `.app-hero` `.app-hero__grid/id/icon/meta/title/lead/facts/visual` `.back` `.tag` `.tag--brand` | |
| 숫자 띠 | `.facts` `.facts__grid` `.fact` `.fact__num/label` | 히어로 아래 `margin-top:-40px` 로 겹친다. **정확히 4개** |
| 기능 행 | `.feat` `.feat--soft` `.feat--flip` `.feat__grid/text/media` `.feat__media--duo` `.shot` `.checks` | flip 은 글이 오른쪽. soft/일반을 번갈아 |
| 접힘 | `.more` `.more__body` | `<details>`. summary 의 `<small>` 은 640 미만에서 숨김 |
| CTA 띠 | `.cta` `.cta__icon` `.cta__note` | `class="cta dark"` |

**스크린샷 규칙** — `src/assets/images/<slug>/screenshots/*.png` 는 **에뮬레이터 베젤이 이미 박혀 있고 모서리가 투명**하다. CSS 폰 프레임을 덧씌우지 않는다. 그림자는 `filter: drop-shadow()` 만(`box-shadow` 는 네모로 보인다). 이미 `.phone` `.tile__shot` `.shot` 에 걸려 있다.

**Phase 1 에서 CSS 에 추가할 것** — ✅ 2026-10-15 앞의 셋 추가. 덧붙여 ≥1100 작은 타일은 아이콘을 위로 올리고(column) 설명 2줄 clamp·min-height 440 (영문 긴 이름이 단어 중간에서 끊기던 문제)
- `.tile--more` — 영어 홈 벤토의 빈 칸을 채우는 "전체 앱 보기" 타일(연회색 바탕, 가운데 화살표 텍스트, 점선 테두리 금지·실선 `--line`).
- `.app-hero--plain` — 스크린샷 없는 stub 용. 1열, 글 max-width 40rem, 비주얼 없음.
- `.prose` — 개인정보처리방침·404 같은 본문 페이지용 타이포(h1/h2/p/ul 간격). 옛 `.page-content` 를 대체.
- `.doc-layout` `.doc-aside` — weatherno 2쪽과 AgeMap 도움말이 쓰던 사이드바형. Phase 4 에서 필요해질 때 만든다.

---

## 4. 홈 규격

### 4.1 한국어 홈 `/` (시안 `src/v2/index.njk` 가 곧 규격)

섹션 순서와 데이터 소스:

1. **히어로** `hero dark` — 필 "Boolint Apps · Android & iOS" / H1 `쏠만한 앱 하나쯤은<br>분명 있을 거예요` / lead / 버튼 `대표 앱 보기`(#featured, light) + `전체 앱 N개`(#apps, ghost) / 통계 3개(출시 앱 N · 플랫폼 2 · 분야 4) / 오른쪽 폰 3장(camlocation 01 · satpic 06 · transtax 04). N 은 `apps | visibleIn('ko') | length`.
2. **대표 앱** `#featured` — `featured:true` 앱을 apps.json 배열 순서대로. **앞의 2개가 large**, 나머지 small. 타일 색·스크린샷은 apps.json `tile` 필드(§6).
3. **전체 앱** `#apps` `section--soft` — 분야 칩 4개 → 분야별 `.cat`(id `cat-<key>`) + `.app-list`. 각 분야 한 줄 설명은 템플릿 상수(아래 표).
4. **만드는 방식** — 3단 카드(공식 데이터 / 열면 바로 / 두 플랫폼). 문구는 시안 그대로.
5. 푸터(레이아웃).

| 분야 키 | 표시명 | 한 줄 |
|---|---|---|
| weather-road | 날씨·도로 라이브 | 위성·레이더 영상과 도로 CCTV 를 시간순으로 |
| realestate | 부동산·세금 | 세금 계산기부터 실거래 차트, 재개발 정보까지 |
| daily-tool | 일상 도구·만들기 | 생일 관리, 사진 지도, 아이콘 메이커 |
| learning | 학습·교양 | 태양계 3D 크기 비교와 영어 숫자 읽기 |

### 4.2 영어 홈 `/en/` (새로 만든다, 구조는 4.1 과 동일)

- 노출 앱: `apps | visibleIn('en')` (현재 12개). **realestate 분야는 섹션 자체를 내지 않는다**(영어 홈 정책 유지). 칩도 3개.
- 대표 앱: `featuredEn:true` 5개(satpic, camlocation, weathertw, weatherus, universedaily). 앞 2개 large, 3개 small, **남는 1칸은 `.tile--more`("All apps →", #apps)**.
- 히어로 폰 3장: camlocation · satpic · universedaily(`screenshots/en/`). 통계: Apps N · Platforms 2 · Areas 3.
- 영어 카피(확정안, 그대로 써도 됨):
  - 필 `Boolint Apps · Android & iOS`
  - H1 `Find one worth keeping`
  - lead `Live weather radar and road cameras, a 3D solar system, a photo atlas. Small apps built on public data — open and use, no sign-up.`
  - 버튼 `See featured` · `All N apps`
  - 대표 앱 머리 eyebrow `Featured` / H2 `Six to open first` → 영어는 5개이므로 `Start with these` / sub `The most used, and the longest refined.`
  - 전체 앱 머리 `All apps` / `Grouped by what they do` / `Each one does a single job. Pick what you need.`
  - 분야 한 줄: weather-road `Satellite and radar loops, plus road cameras` · daily-tool `Birthdays, a photo map, an icon maker` · learning `A 3D solar system and Korean numbers` (영어 홈의 앱 이름이 Korean Numbers 라 Phase 1 에서 고침)
  - 만드는 방식 `How we build` / `Small, accurate, ready to use` — 카드: `Official data only` / `Open and use` / `Both platforms` (본문은 한국어 카드를 직역, 2문장 이내)
- 스크린샷은 `screenshots/en/` 폴더가 있으면 그것을, 없으면 한국어 세트를 쓴다(satpic·camlocation 은 en 세트가 없다).

### 4.3 헤더·푸터 문자열 → `i18n.json`

시안은 header/footer 에 ko/en 을 인라인 분기했다. 아래 키를 **ko·en·es·cs 네 로케일 모두**에 추가하고 템플릿이 `t[...]` 로 읽게 바꾼다(es·cs 는 개인정보처리방침 한 쪽뿐이지만 그 페이지도 Phase 4 에서 v2 헤더·푸터를 쓴다. 없는 키는 조용히 빈 문자열로 렌더되므로 반드시 채운다).

`nav.featured` `nav.all` `footer.tagline` `footer.categories` `footer.info` `footer.platforms`(= "Android · iOS")

---

## 5. 앱 페이지 규격

### 5.1 블록 순서 (시안 `src/v2/satpic/index.njk` 가 곧 규격)

| # | 블록 | 매크로 | 내용 규격 |
|---|---|---|---|
| 1 | 히어로 | `m.appHero()` | 뒤로가기 `← 모든 앱`, 아이콘 72, 태그(분야 brand + `Android · iOS` + `무료`), H1 = 앱 이름, lead **2문장 이내**, 배지, 사실 3~4개(회원가입 없음·최소 OS·언어·다크모드 등 **옛 페이지 '앱 정보' 절에서**), 폰 1~2장 |
| 2 | 숫자 띠 | `m.facts()` | **정확히 4개**. 숫자가 안 나오는 앱은 짧은 명사("태풍·황사", "전국") 허용. 숫자의 근거는 옛 페이지 본문 |
| 3~7 | 기능 행 | `{% call m.feat() %}` | **3~5개**. eyebrow(1~3단어) · 제목(두 줄까지, `<br>` 로 끊는 위치 지정) · 문단 1 · 체크 3. 스크린샷 1장, 비교가 필요한 블록만 2장(`duo`). soft/일반 번갈아, flip 도 번갈아 |
| 8 | 비교 | `m.compare()` | 3장. 옛 페이지의 "다른 앱과 무엇이 다를까요" 절이 있으면 그걸 압축, 없으면 **블록 생략** |
| 9 | 모든 기능 | `{% call m.more() %}` | 기능 행에 넣지 않은 **옛 페이지의 나머지 내용 전부**를 2~4개 묶음(`<div><h4>…</h4><ul>…</ul></div>`)으로. 문장은 명사구로 줄여도 되지만 **항목을 빠뜨리지 않는다** |
| 10 | 신뢰 | `m.trust()` | 데이터 출처 / 프라이버시 / (안전 안내 또는 앱 정보). 옛 페이지의 해당 절에서 |
| 11 | CTA | `m.cta()` | 아이콘 80, 한 줄 제목, lead 1문장, 배지, 작은 글씨 앱 정보 한 줄(무료·광고·OS·언어) |

계산기 앱(acqtax·gifttax·transtax·mysalary·junsewolse·realestatecal)은 옛 페이지에 `case-box`(계산 사례)가 있다. 사례는 기능 행 한 칸의 본문으로 넣되 **숫자를 그대로 옮긴다.** `.case-box` 스타일이 v2 에 없으므로 Phase 2 의 transtax 에서 `.case` 컴포넌트를 추가한다(연한 바탕 + 왼쪽 굵은 선 + 결과 줄 강조. 옛 `components.css` 의 `.case-box` 를 토큰만 바꿔 이식).

### 5.2 매크로 계약 (Phase 1 에서 `v2/macros.njk` 에 구현)

```njk
{% import "v2/macros.njk" as m %}

{# 히어로 — shots 는 1~2개, 첫 장이 가운데(phone--c), 둘째가 오른쪽(phone--r). shots 를 비우면 app-hero--plain #}
{{ m.appHero({
  app: app, lang: 'ko', home: '/',
  category: '날씨·도로 라이브', tags: ['Android · iOS', '무료'],
  title: '날씨위성영상 라이브',
  lead: '…',
  playUrl: playUrl, appStoreUrl: app.appStoreUrl,
  facts: ['회원가입 없음', 'Android 8.0 이상', '한국어·영어·일본어·중국어', '다크 모드'],
  shots: [ { src: '…/02_visible_korea.webp', w: 720, h: 1533 }, { src: '…/06_radar_korea.webp', w: 720, h: 1533 } ]
}) }}

{{ m.facts([ { num: '9', label: '위성 조합 · …' }, {…}, {…}, {…} ]) }}

{% call m.feat({ eyebrow: '위성', title: '가시광선·적외선·수증기,<br>세 가지 눈으로 봅니다', flip: true, soft: true,
                shots: [ { src: '…', alt: '…', w: 720, h: 1533 } ] }) %}
  <p>…</p>
  <ul class="checks"><li><strong>가시광선</strong>은 …</li><li>…</li><li>…</li></ul>
{% endcall %}

{{ m.compare({ eyebrow: '다른 날씨 앱과', title: '무엇이 다를까요',
               cards: [ { vs: '기상청 공식 앱과 비교하면', title: '같은 출처, 다른 동선', text: '…' }, {…}, {…} ] }) }}

{% call m.more('모든 기능 보기', '지역 레이더 · 지도형 자료 · 동네 예보 · 조작') %}
  <div><h4>지역 레이더 9곳</h4><ul><li>…</li></ul></div>
{% endcall %}

{{ m.trust([ { icon: 'db', title: '데이터 출처', items: ['…'] },
             { icon: 'lock', title: '프라이버시', items: ['…'] },
             { icon: 'warn', title: '안전 안내', text: '…' } ]) }}

{{ m.cta({ app: app, lang: 'ko', title: '지금 하늘을 확인해 보세요', lead: '…',
           playUrl: playUrl, appStoreUrl: app.appStoreUrl, note: '무료 · 광고 포함 · …' }) }}
```

구현 메모
- `title` 에 `<br>` 이 들어가므로 매크로 안에서 `{{ opts.title | safe }}`.
- `{% call %}` 본문은 매크로 안에서 `{{ caller() }}` 로 출력한다(Nunjucks 지원).
- (Phase 1 구현) `trust` 의 items·text, `compare` 의 text, `cta` 의 title·lead 도 `| safe` — `<strong>` 을 넣을 수 있다. 아이콘은 `m.icon(name)` 으로 따로도 쓴다. 홈 타일은 `m.tile(app, lang, prefix, catName, large)`.
- (Phase 1 구현) 영어 페이지 Play 링크는 옛 페이지처럼 `+ '&hl=en&gl=US'` 를 붙였다.
- `icon` 은 `db | lock | warn | shield | bolt | devices` 여섯 개를 매크로 안 인라인 SVG 로 둔다(시안 HTML 에 있는 path 를 옮긴다).
- `playUrl` 은 페이지에서 `'https://play.google.com/store/apps/details?id=' + app.packageName` 로 만든다. iOS 가 없으면(`'ios' not in app.platform`) `appStoreUrl` 을 넘기지 않는다.
- 영어 페이지는 `lang: 'en'` 을 넘기면 뒤로가기 문구·배지 언어·`home` 이 바뀐다. 매크로 안에서 `'← All apps' if lang == 'en' else '← 모든 앱'`.

### 5.3 stub 앱 (myweathertw · finedustmap)

풀랜딩 원고가 없다. `appHero`(shots 없음 → plain) + `cta` 두 블록만. 옛 stub 의 한두 단락을 lead 로 압축. 스크린샷이 없으니 facts·feat 는 넣지 않는다. 나중에 원고가 생기면 §5.1 대로 채운다.

---

## 6. 데이터 변경 — `apps.json`

⚠️ **파일을 json.dump 로 다시 쓰지 말 것.** 원본은 한 필드 한 줄(name/description 은 한 줄 객체) 형식이다. 시안 세션에서 통째로 재포맷돼 562줄 diff 가 났다가 되돌렸다. 줄 단위 삽입(Edit 도구)으로만 고친다.

추가 필드(featured 또는 featuredEn 인 앱에만):

```json
"tile": { "tint": "navy", "shot": "/assets/images/satpic/screenshots/06_radar_korea.webp", "w": 720, "h": 1533 }
```

- `tint` ∈ navy · sky · mint · amber · sand · rose · violet. **확정 배정**: satpic **navy** · camlocation **sky** · transtax **amber** · weathertw **mint**(영어 홈만) · propertytax **mint**(한국 홈만) · seoullife **rose** · weatherus **violet**(영어 홈만) · universedaily **sand**(한·영 홈 모두). `shot` 은 문자열 또는 `{ ko, en }`(언어별 화면, universedaily). 한국 홈과 영어 홈에서 같은 앱은 같은 색이다.
- `shot` 은 **WebP** 경로(§7). `w`/`h` 는 WebP 의 실제 픽셀.
- 홈 템플릿의 `tiles` 하드코딩 배열을 지우고 `apps | visibleIn(lang)` 중 `featured`(ko)/`featuredEn`(en) 인 것을 순회하며 `app.tile` 을 읽는다. `tile` 이 없으면 빌드 시 `throw` 하지 말고 **스크린샷 없는 타일**로 렌더(배포가 깨지지 않게).

`site.json` 의 `year` 는 2025 다. **2026 으로 고친다**(푸터 저작권. 옛 푸터에도 같이 반영되므로 무해).

---

## 7. 이미지 처리

시안 satpic 페이지는 PNG 그대로라 **15MB** 를 받는다. 직전 커밋(9937d2a)이 배너를 WebP 로 바꿔 LCP 를 잡았는데 그걸 되돌리는 셈이다. **v2 페이지가 참조하는 스크린샷은 전부 WebP 로**.

규칙
- 원본 PNG 옆에 같은 이름 `.webp`. PNG 는 지우지 않는다(옛 페이지가 아직 쓴다. Phase 4 끝에 미참조 PNG 정리).
- 긴 변 기준이 아니라 **폭 720px** 로 축소(화면 표시 최대 ~330px × 2배 DPR). 알파 유지. quality 82.
- `cwebp` 가 없다. PIL 로:

```python
from PIL import Image
import sys
for p in sys.argv[1:]:
    im = Image.open(p).convert('RGBA')
    if im.width > 720:
        im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    im.save(p[:-4] + '.webp', 'WEBP', quality=82, method=6)
    print(p, '->', im.size)
```

- 페이지마다 **쓰는 파일만** 변환한다(저장소 비대 방지). 한 페이지가 보통 7~9장.
- `<img>` 에는 항상 `width`/`height`(WebP 실제 픽셀)와 `loading="lazy"`(히어로 폰은 제외 — 첫 화면이다) 를 둔다.
- 아이콘은 PNG 512 그대로 두되 52/72/80px 로만 표시한다(파일 크기 50KB 내외라 그대로 OK).

---

## 8. 실행 계획

각 Phase 끝에 `npm run build` 무오류 + §10 검증 + **커밋 제안**(사용자 승인 후 커밋. 메시지 첫 줄은 "v2: …"). push 는 Phase 1 완료 후 사용자가 "배포" 라고 할 때만 — Cloudflare Pages 가 `main` 을 보고 있으므로 **redesign 브랜치를 push 해도 배포되지 않는다**. 배포는 main 병합 시점이다.

### Phase 0 — 시작 (15분)
- [x] `git branch --show-current` 가 `redesign` 인지, `git status` 에 §2 파일이 있는지 확인. 없으면 **멈추고 사용자에게 알린다**(작업 트리가 날아간 것).
- [x] `npm run dev` 띄우고 사용자에게 두 시안 URL 을 보여 준다. 피드백(색·간격·문구)을 받아 이 문서 §13 "피드백 로그"에 적고 반영한다.
- [x] "회원가입·로그인 없음" 문구에 예외 앱이 있는지, 아파트 공시가격 아이콘 원본 위치를 묻는다.

### Phase 1 — 기반 확정 (한 세션) — ✅ 2026-10-15 완료
1. `v2.njk` 에 `pageCss`/`pageJs` 지원(옛 `base.njk` 와 같은 방식)과 `bodyClass` 변수 추가.
2. `macros.njk` 에 §5.2 매크로 7개 구현. `src/v2/satpic/index.njk` 를 매크로 호출로 재작성 → 빌드 결과 HTML 이 재작성 전과 **구조적으로 동일**(클래스·순서)한지 diff 로 확인.
3. `apps.json` 에 `tile` 필드(§6) → 홈 템플릿의 하드코딩 제거. `site.json` year 2026.
4. WebP 변환: 홈 폰 3장 + 타일 6+2장 + satpic 9장. 템플릿 경로 교체.
5. i18n 키 6개(§4.3) 네 로케일 추가, header/footer 가 그걸 읽게.
6. **교체**: `src/index.njk` ← v2 홈, `src/satpic/index.njk` ← v2 앱 페이지(front matter 의 `title`·`description`·`alternateLang/Url` 은 옛 파일 것을 유지, `permalink`·`eleventyExcludeFromCollections`·`homeUrl` 제거). `src/v2/` 삭제. header/footer 의 `homeUrl` 분기 제거.
7. 영어 홈 `src/en/index.njk` v2 화(§4.2) + `src/en/satpic/index.njk` v2 화(한국어 satpic 의 영어 대응. 옛 영어 페이지 본문이 원고).
8. CSS 추가분: `.tile--more` `.app-hero--plain` `.prose`(Phase 4 대비, 지금 만들어도 됨).
9. §10 검증 전부 → 커밋 제안.

### Phase 2 — 대표 앱 (한 세션, 8쪽) — ✅ 2026-10-15 완료 (main 병합·배포는 사용자 결정 대기)
순서대로: camlocation ko·en → transtax ko(⚠️ 옛 페이지에 case-box 가 없어 `.case` 는 **Phase 3 의 acqtax 로 미룸**) → weathertw ko·en → propertytax ko → seoullife ko → weatherus en → universedaily ko·en.
각 쪽은 §9 체크리스트. 끝나면 커밋 제안. **이 시점에 사용자가 원하면 main 병합·배포 가능**(옛 페이지와 새 페이지가 섞여도 깨지지 않는다 — 헤더·푸터만 다르게 보인다. 사용자에게 그 점을 말하고 결정을 받는다).

### Phase 3 — 나머지 앱 (2~3 세션, 분야별 묶음) — ✅ 2026-10-15 완료
- realestate ko 8 (**acqtax 를 먼저** — `.case` 컴포넌트를 여기서 추가. case-box 를 쓰는 옛 페이지는 mysalary·acqtax·gifttax 셋): mysalary, acqtax, gifttax, junsewolse, realestatecal, busanlife, apttradechart, officetradechart
- weather-road: myweather ko·en, myweathertw ko·en(stub), finedustmap ko·en(stub)
- daily-tool: agemap ko·en(도움말 7×2 쪽은 Phase 4), snapatlas ko·en, iconmixer ko·en
- learning: englishnumber ko·en
- hidden 인데 페이지가 있는 것: weatherno ko·en(사이드바형 `app.njk` 사용 — `.doc-layout` 필요), aptrentchart ko. 맨 뒤로.

### Phase 4 — 공통 페이지와 정리 — ✅ 2026-10-15 완료 (`v2.njk → base.njk` 개명은 선택 항목이라 하지 않음. 미참조 PNG 는 스크린샷만 지우고 배너·프리뷰 원본은 남김)
1. privacy ko·en·es·cs → v2 + `.prose`. **네 판 내용은 건드리지 않는다**(법적 문서. 레이아웃만).
2. 404 → v2. sitemap 은 그대로.
3. agemap 도움말 14쪽 → v2 + `.doc-layout`(왼쪽 목차 aside). weatherno 2쪽도 같은 레이아웃.
4. `/trend/` → v2 (`pageCss`/`pageJs` 로 trend.css/js 그대로). 화면이 깨지면 trend.css 가 옛 변수(`--color-*`, `--space-*`)를 쓰는 탓이다 → trend.css 머리에 그 변수들만 다시 선언한다.
5. `grep -rl "layouts/base.njk\|layouts/app.njk" src` 가 **0** 이면: `base.njk` `app.njk` `app-card.njk` `global.css` `components.css` 삭제, `v2.njk` → `base.njk` 로 개명(선택), 미참조 PNG 스크린샷 정리, `CLAUDE.md` 의 디렉토리·CSS 절 갱신, 이 문서 §0 을 "완료" 로.

---

## 9. 앱 페이지 한 쪽 이전 체크리스트 (복붙용)

```
[ ] 옛 src/<slug>/index.njk 를 끝까지 읽고 사실 목록을 뽑는다(채널 수·지역 수·출처·권한·OS·언어·가격)
[ ] 기능 블록 3~5개를 고른다 — 옛 페이지 h2 중 스크린샷이 붙어 있고 사용자 가치가 큰 것부터
[ ] 숫자 띠 4개를 사실 목록에서 고른다
[ ] 쓸 스크린샷을 고르고 WebP 로 변환한다(§7). 한 블록 1장, 비교 블록만 2장
[ ] 새 파일 작성: front matter(title/description/alternateLang/alternateUrl 은 옛 것 유지) + 매크로 호출
[ ] 기능 블록에 안 들어간 옛 내용은 전부 m.more 안으로(항목 누락 금지)
[ ] 신뢰 카드: 출처·프라이버시·(안전|앱 정보). 광고 고지 문장은 옛 것 그대로
[ ] en 대응 쪽이 있으면 같은 구조로, 영어 원고는 옛 src/en/<slug>/ 에서
[ ] npm run build → _site/<slug>/index.html 열어 깨진 이미지 0, 링크 404 0
[ ] 데스크톱 1440 + 모바일 390(iframe 하네스) 캡처로 한 번 훑는다 — 제목이 세 줄로 넘치는지, duo 가 겹치는지
[ ] apps.json 의 description(카드 한 줄)이 새 lead 와 어긋나지 않는지
```

---

## 10. 검증 방법

**빌드**: `npm run build` — `[11ty] Wrote N files` 외 경고·오류가 없어야 한다.

**내부 링크 404 검사**(복붙):
```bash
python3 - <<'EOF'
import re,glob,os
bad=0
for f in glob.glob('_site/**/*.html',recursive=True):
    for u in set(re.findall(r'(?:href|src)="(/[^"#?]*)',open(f,encoding='utf-8').read())):
        p='_site'+u
        if not (os.path.isfile(p) or os.path.isfile(os.path.join(p,'index.html'))): print(f,'->',u); bad+=1
print('깨진 링크',bad)
EOF
```

**화면 캡처**: 헤드리스 크롬. ⚠️ **창 폭을 390 으로 줘도 레이아웃 뷰포트는 ~500px** 이다(데스크톱 크롬 최소 창 폭). 모바일은 반드시 iframe 하네스로.
```bash
# 정적 서버
(nohup python3 -m http.server 8089 --directory _site >/dev/null 2>&1 &)
# 하네스 (빌드마다 다시 만든다 — _site 는 빌드 산출물)
cat > _site/_mobile.html <<'EOF'
<!doctype html><html><body style="margin:0"><iframe id="f" style="border:0;display:block;width:390px;height:9000px"></iframe>
<script>document.getElementById('f').src=location.hash.slice(1)||'/';</script></body></html>
EOF
CH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,5200 --virtual-time-budget=10000 --screenshot=desk.png http://localhost:8089/satpic/
"$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=500,9000  --virtual-time-budget=10000 --screenshot=mob.png 'http://localhost:8089/_mobile.html#/satpic/'
# mob.png 는 왼쪽 390px 만 유효. PIL 로 1400px 조각으로 잘라 본다. 끝나면 pkill -f "http.server 8089"
```
zsh 에 `shot` 별칭이 있어 같은 이름의 함수를 못 만든다. 스크립트 파일로.

**이미지 무게**: 한 페이지의 이미지 합이 **1.5MB 이하**(`grep -o 'src="[^"]*"' _site/<slug>/index.html` 로 목록 뽑아 `du -k`).

---

## 11. 함정 목록

- **Nunjucks `for` 안의 `{% set %}` 은 루프 밖으로 안 나온다.** 그래서 `bySlug`·`visibleIn`·`inCategory` 필터를 만들었다. 템플릿에서 카운트하려고 루프 돌리지 말고 `| visibleIn('ko') | length`.
- **apps.json 재포맷 금지**(§6).
- **스크린샷에 베젤이 이미 있고 모서리가 투명** → CSS 프레임 금지, `drop-shadow` 만(§3). 앱마다 해상도가 다르다(720×1616 ~ 1332×2652). `object-fit` 으로 억지로 맞추지 말고 그대로 둔다.
- **Google Play 배지 PNG 에 투명 여백이 있다** → 52px 일 때 Apple 40px 과 시각 높이가 같다. 배지는 수정·재색칠 금지(브랜드 가이드).
- **`public/_headers`** 의 `/assets/*` 는 `max-age=3600`. `immutable` 금지(파일명에 해시가 없다). CSS 를 고치면 `v2.njk` 의 `?v=` 를 올린다.
- **Pretendard 는 CDN(jsdelivr) 로드**. 오프라인 캡처에선 시스템 폰트로 찍힌다 — 글자 폭이 달라 줄바꿈이 다르게 보일 수 있다.
- **`weatherus` 는 영문 전용**(`showInKorean:false`). 한국 홈·한국어 페이지를 만들지 않는다. `hidden` 과 다르다(hidden 은 영어 홈까지 막는다).
- **카테고리는 4개 고정**. 앱의 category 를 바꾸지 않는다. 노출 순서는 apps.json 배열 순서(sort 없음).
- **홈 `#cat-<key>` 앵커**와 푸터 분야 링크가 짝이다. id 를 바꾸면 푸터도.
- 히어로 폰 이미지에 `loading="lazy"` 를 주지 말 것(첫 화면). 그 외는 lazy.
- `.dark` 면 위의 헤더는 흰 반투명이다. 의도된 대비. 헤더를 투명하게 바꾸지 않는다.
- **`/trend/` 는 앱 소개가 아니라 동작하는 웹앱**이다(trend.css/js). Phase 4 전까지 건드리지 않는다.
- 개인정보처리방침 **네 판(ko·en·es·cs)은 같은 문서**다. 레이아웃만 바꾸고 문장은 손대지 않는다.
- **제목의 `<br>` 바로 앞에 `—` 를 두지 말 것.** 좁은 폭에서 `—` 가 혼자 한 줄로 떨어진다(Phase 1·2 에서 세 번). 쉼표·콜론으로 끊는다.
- **`universedaily/screenshots/en/` 은 02번부터 파일 이름과 화면이 한 칸씩 밀려 있다**(08_saturn=달, 10_gallery=명왕성, 갤러리 화면 없음). 이름을 믿지 말고 화면을 보고 고른다. ko 폴더는 정상.
- 다른 앱도 스크린샷을 고르기 전에 **컨택트시트로 실제 화면을 확인**한다(PIL 로 한 줄에 이어 붙여 Read).
- 옛 페이지에 **비교 절·프라이버시 절이 없으면 만들지 않는다.** compare 는 생략, trust 는 `계산 기준`/`앱 정보`/`참고 안내` 처럼 옛 페이지에 있는 절로 채운다. 광고 고지 문장도 옛 페이지에 있을 때만.

---

## 12. 완료 정의

- [x] 모든 페이지가 `v2.njk` 를 쓰고 `grep -rl "layouts/base.njk\|layouts/app.njk" src` 가 비어 있다
- [x] 옛 CSS 2개·옛 레이아웃·`app-card.njk` 삭제, 사이트맵에 `/v2/` 없음
- [x] 홈 ko/en 이 §4, 앱 페이지가 §5 구조를 따른다. stub 2개는 plain 히어로 + CTA
- [x] 내부 링크 404 = 0, 페이지당 이미지 ≤ 1.5MB, 빌드 경고 0
- [ ] 데스크톱 1440·모바일 390 캡처를 사용자가 한 번 확인 ← **남음**
- [x] `CLAUDE.md` 의 기술 스택·디렉토리·CSS 절이 새 구조를 설명하고, 이 문서 §0 이 "완료"

---

## 13. 피드백 로그

| 날짜 | 누가 | 내용 | 반영 |
|---|---|---|---|
| 2026-10-15 | 사용자 | 톤·범위·진행·깊이 4개 결정(§0) | 시안에 반영 |
| 2026-10-15 | 사용자 | Phase 0: 두 시안 그대로 OK(색·간격·문구 변경 없음) | — |
| 2026-10-15 | 사용자 | "회원가입·로그인 없음" 예외 앱 **없음** → 홈 카피 그대로 | — |
| 2026-10-15 | 사용자 | 영어 홈 히어로 오른쪽 폰·universedaily 타일 = `universedaily/screenshots/en/01_today_sun`, weatherus 타일 = `01_radar.webp`(이미 WebP 960×2080, 베젤 없음) | apps.json `tile` |
| 2026-10-15 | 사용자 | ≥1100 작은 타일: 아이콘을 위로(영문 이름 끊김 해결) | v2.css |
| 2026-10-15 | 사용자 | 영어 홈 학습 분야 한 줄 English numbers → **Korean numbers** | §4.2 |
| 2026-10-15 | 사용자 | 영어 홈 '만드는 방식' 첫 카드는 기관명 직역 대신 일반화 문장 유지 | en/index.njk |
| 2026-10-15 | Claude | 시안 satpic 의 광고 고지가 줄어 있던 것을 §9 규칙대로 옛 문장으로 복원 | satpic ko |
| 2026-10-15 | 사용자 | apttradechart 는 스크린샷 없이 글로(plain 히어로 + 3단 카드). aptrentchart 도 같은 구성 준용 | 두 페이지 |
| 2026-10-15 | 사용자 | 아이콘 추가 승인 — acqtax(`AndroidStudioProjectsData/AcqTax(취득세)/playstore/main512.png`), apttradechart(`…/AptTradeChart(아파트실거래가)/image/main512.png`) | apps.json iconReady |
| 2026-10-15 | Claude | realestatecal·myweathertw 아이콘은 propertytax 와 같은 경로 규칙(`app/src/main/ic_launcher-playstore.png`)에서 확인 후 추가. finedustmap 은 원본 못 찾음 → 첫 글자 | apps.json |
| 2026-10-15 | Claude | myweather 옛 스크린샷이 288px 라 흐림 → `AndroidStudioProjectsData/날씨비서/screenshot/framed`(2026-05, 베젤·광고 없음)에서 가져옴 | myweather/screenshots/ |
| 2026-10-15 | Claude | 옛 페이지에 가격 정보가 없는 앱(agemap·weatherno)은 "무료" 표기를 넣지 않음 | 두 앱 |
| 2026-10-15 | Claude | weatherno 는 사이드바(app.njk) 메뉴가 "소개" 하나뿐이라 `.doc-layout` 없이 stub 으로 이전 | weatherno ko/en |
| 2026-10-15 | Claude | 계산 사례가 있는 3쪽(acqtax·mysalary·gifttax)에 `m.case` 사용, 조건 문단용 `note` 추가 | macros |
| 2026-10-15 | Claude | /trend/ 는 trend.css 를 고치지 않고 레이아웃만 교체 — trend.css 는 크롬 확장이 복사해 쓰고 옛 변수에 폴백이 이미 있다 | /trend/ |
| 2026-10-15 | Claude | AgeMap 도움말 목차는 `_data/agemapHelp.json` + `layouts/v2-doc.njk`. 본문 이미지는 WebP 로 교체 | 도움말 14쪽 |
| 2026-10-15 | 사용자 | 한국 홈 대표 앱: weathertw(한국어 UI 없음) → universedaily. propertytax 를 mint 로 바꿔 sand 겹침 해소, tile.shot 언어별 지원 | apps.json, macros |
| 2026-10-15 | 사용자 | Phase 2 부터 "특별한 문제가 없으면 커밋하고 계속" — 쪽마다 검증 통과 시 커밋 | 쪽당 커밋 1개 |
| 2026-10-15 | Claude | transtax 에 case-box 가 없어 `.case` 를 Phase 3 acqtax 로 미룸 | §8 |
| 2026-10-15 | Claude | universedaily 영어 스크린샷 파일명 어긋남 발견 → 화면 기준으로 매핑, 파일명은 그대로 | §11 |
| 2026-10-15 | 사용자 | propertytax 아이콘 원본 = `~/AndroidStudioProjects/PropertyTax/app/src/main/ic_launcher-playstore.png` (512) | `images/propertytax/icon.png` 복사 + `iconReady:true` |

---

## 14. 다음 세션 시작 프롬프트 (사용자가 붙여넣는 용도)

```
~/server/homepage 에서 boolint.com v2 재설계를 이어서 진행해 줘.
정본은 docs/REDESIGN_V2_SPEC.md 다. 먼저 그 문서 전체와 CLAUDE.md 맨 위 "다음 세션 시작점"을 읽고,
Phase 0 (브랜치·작업 트리 확인 → npm run dev → 시안 URL 안내 → 내 피드백 수집) 부터 시작해.
Phase 를 하나 끝낼 때마다 멈추고 커밋 여부를 물어봐. 사양에 없는 결정은 네가 정하지 말고 물어봐.
```
