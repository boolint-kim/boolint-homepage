# 홈페이지 재구조 SPEC

작성: 2026-05-21
목적: 쇼츠 → boolint.com 랜딩 시 첫인상을 강화하기 위해, 카테고리와 노출 앱을 정비한다.

## 배경

- 외부 마케팅 채널이 사실상 쇼츠 채널정보 링크뿐.
- SNS 팔로워 적고 늘리기 어려움.
- 따라서 홈페이지 첫인상이 중요 → **주력·밀고 싶은 앱만 노출**, 나머지는 hidden.
- 상세 페이지 콘텐츠 작성 부담이 있어 분산 대신 집중 전략.

---

## 플래그 정의

### `koreaOnly: boolean` (기존, 의미 명확화)
**데이터 사실**: 앱이 다루는 콘텐츠·데이터·시장이 한국 한정인지 여부.
- 예: 한국 부동산 실거래가, 양도세, 서울 재건축.
- **노출과 무관한 메타데이터**. 분석·필터·검색용.

### `showInEnglish: boolean` (신규)
**UI 결정**: 영어 홈에 노출할지 여부.
- 영어 페이지가 존재할 때만 `true`로 설정 (없으면 404).

#### 기본값 규칙 (showInEnglish 미지정 시)
- `koreaOnly == true` → 자동 `false` (영어 홈 숨김)
- `koreaOnly == false` 또는 미지정 → 자동 `true` (영어 홈 노출)
- `showInEnglish: true` 명시 → 강제 노출 (예: CamLocation은 koreaOnly지만 영어 페이지 있고 외국인 유용)

### `featured: boolean` (신규)
한국 홈 featured 섹션 노출 마커.

### `featuredEn: boolean` (신규)
영어 홈 featured 섹션 노출 마커. `featured`와 독립적.

### `hidden: boolean` (기존)
홈페이지 미노출 (메인·카테고리·featured 모두 제외).

---

## 새 카테고리 구조 (4개, 한국 21개 / 영어 11개)

| 카테고리 키 | 표시명 (ko) | 표시명 (en) | 한국 노출 | 영어 노출 |
|---|---|---|---|---|
| `weather-road` | 날씨·도로 라이브 | Weather & Road Live | 6 | 6 |
| `realestate` | 부동산·세금 | (영어 홈 제외) | 10 | 0 |
| `daily-tool` | 일상 도구·만들기 | Daily Tools & Maker | 3 | 3 |
| `learning` | 학습·교양 | Learning & Knowledge | 2 | 2 |

영어 명칭은 제안. 사용자 확인 후 i18n.json에 반영.

---

## 21개 앱 플래그 마스터 표

| # | slug | category | koreaOnly | showInEnglish | featured | featuredEn | en 페이지 |
|---|---|---|---|---|---|---|---|
| 1 | satpic | weather-road | **true** | **true** | **true** | **true** | ✅ |
| 2 | camlocation | weather-road | true | **true** | **true** | **true** | ✅ |
| 3 | myweather | weather-road | **true** | **true** | - | - | ✅ |
| 4 | weathertw | weather-road | false | (true) | **true** | **true** | ✅ |
| 5 | myweathertw | weather-road | false | (true) | - | - | 🆕 신규 |
| 6 | finedustmap | weather-road | false | (true) | - | - | 🆕 신규 |
| 7 | transtax | realestate | true | (false) | **true** | - | ❌ |
| 8 | acqtax | realestate | true | (false) | - | - | ❌ |
| 9 | gifttax | realestate | true | (false) | - | - | ❌ |
| 10 | propertytax | realestate | true | (false) | **true** | - | ❌ |
| 11 | junsewolse | realestate | true | (false) | - | - | ❌ |
| 12 | realestatecal | realestate | true | (false) | - | - | ❌ |
| 13 | seoullife | realestate | true | (false) | **true** | - | ❌ |
| 14 | busanlife | realestate | true | (false) | - | - | ❌ |
| 15 | apttradechart | realestate | true | (false) | - | - | ❌ |
| 16 | officetradechart | realestate | true | (false) | - | - | ❌ |
| 17 | agemap | daily-tool | false | (true) | - | - | ✅ |
| 18 | snapatlas | daily-tool | false | (true) | - | - | ✅ |
| 19 | iconmixer | daily-tool | false | (true) | - | - | 🆕 신규 |
| 20 | universedaily | learning | false | (true) | - | **true** | ✅ |
| 21 | englishnumber | learning | false | (true) | - | - | 🆕 신규 |

표기:
- `(true)` / `(false)` = 기본값 규칙으로 자동, JSON에 명시 안 함.
- 굵은 글씨 = JSON에 명시 필요.
- `-` = false, 명시 안 함.

### Featured 6개 (한국 홈)
순서: satpic, camlocation, transtax, weathertw, propertytax, seoullife

### Featured 4개 (영어 홈)
순서: satpic, camlocation, weathertw, universedaily

---

## 상단 (Hero) 구조

### 공통
- `home-hero` 풀와이드 배너 (banner.png) — 그대로 유지.

### featured 섹션
- 한국: 6개, 2x3 그리드 (`featured == true` 필터).
- 영어: 4개, 2x2 그리드 (`featuredEn == true` 필터).
- 현 `.app-grid--featured` CSS (모바일 1열 / 768px↑ 2열) 그대로 사용.

### 중복 노출 정책 (옵션 A)
- featured 앱은 자기 카테고리 섹션에도 함께 표시 (제외하지 않음).
- 앱스토어·구글플레이 표준 패턴. 카테고리 라인업 완전성 유지.

---

## 영어 페이지 신규 생성 (4개)

| slug | 비고 |
|---|---|
| myweathertw | 신규 앱, ko/en 둘 다 생성 필요 |
| finedustmap | ko 페이지 존재 여부 확인 필요 |
| iconmixer | 글로벌 앱, 간단한 소개만 |
| englishnumber | **한국어 학습자(영어 사용자) 대상**으로 설명 재구성 필요 |

`src/en/{slug}/index.njk` 생성. 한 줄 소개 + 스토어 링크면 우선 충분.

---

## apps.json 변경 작업

### A. 카테고리 키 매핑

| 기존 카테고리 | 새 카테고리 |
|---|---|
| weather | weather-road |
| realestate-tax | realestate |
| realestate-chart | realestate |
| tool | daily-tool 또는 learning (앱별 결정) |
| featured | (별도 boolean 필드로 분리) |
| (없음) → realestate | seoullife, busanlife, junsewolse |

### B. featured/featuredEn 마킹

위 표 참조. 한국 6개 / 영어 4개에 boolean 필드 추가.

### C. koreaOnly + showInEnglish 명시 마킹

데이터가 한국 한정이지만 외국인에게도 유용한 앱 (강제 영어 노출):
- satpic: `koreaOnly: true, showInEnglish: true` (한국 기상위성·CCTV·태풍)
- camlocation: `koreaOnly: true, showInEnglish: true` (한국 도로 CCTV)
- myweather: `koreaOnly: true, showInEnglish: true` (한국 날씨 + 도로 CCTV)

이 3개는 모두 영어 페이지 있음. 외국인 거주자·관광객 유용.

(나머지는 기본값 규칙으로 자동 처리)

### D. hidden: true 일괄 적용 (13개)

```
weatherno, parkinglot, maskstore, aptrentchart,
snim, thatsong, jpdramaeng, jpdrama,
mywatches, patternmaker, financeproduct,
weathermy, petblog
```

### E. MyWeatherTW 신규 추가

```json
{
  "slug": "myweathertw",
  "packageName": "com.boolint.myweathertw",
  "name": { "ko": "날씨비서 (대만)", "en": "My Weather Taiwan" },
  "description": {
    "ko": "대만 날씨 + 도로 CCTV를 한 앱에",
    "en": "Taiwan forecasts and road CCTVs in one app"
  },
  "platform": ["android"],
  "hasHelp": false,
  "category": "weather-road"
}
```

`iconReady`, `preview`, `appStoreUrl`은 추후 추가.

---

## index.njk (한국어 홈) 변경

```
home-hero (배너 유지)
└─ home-section--featured (featured == true, 6개, 2x3)
└─ home-section: 날씨·도로 라이브 (category == "weather-road")
└─ home-section: 부동산·세금 (category == "realestate")
└─ home-section: 일상 도구·만들기 (category == "daily-tool")
└─ home-section: 학습·교양 (category == "learning")
```

내부 정렬: **수동 지정 순서** (apps.json 배열 순서 또는 `order` 필드). 현 `| sort(attribute="name.ko")` 제거.

---

## en/index.njk (영어 홈) 변경

```
home-hero (배너 유지)
└─ home-section--featured (featuredEn == true, 4개, 2x2)
└─ home-section: Weather & Road Live (showInEnglish && category == "weather-road")
└─ home-section: Daily Tools & Maker (showInEnglish && category == "daily-tool")
└─ home-section: Learning & Knowledge (showInEnglish && category == "learning")
```

**[부동산·세금] 카테고리 자체 제외** (영어 홈에 섹션 없음).

필터링 헬퍼: `showInEnglish` 기본값 규칙을 Nunjucks 매크로나 11ty data filter로 구현.

---

## i18n.json 변경

새 카테고리 키 추가:

```json
{
  "ko": {
    "home.section.weatherRoad": "날씨·도로 라이브",
    "home.section.realestate": "부동산·세금",
    "home.section.dailyTool": "일상 도구·만들기",
    "home.section.learning": "학습·교양"
  },
  "en": {
    "home.section.weatherRoad": "Weather & Road Live",
    "home.section.dailyTool": "Daily Tools & Maker",
    "home.section.learning": "Learning & Knowledge"
  }
}
```

기존 키(`weather`, `realestateTax`, `realestateChart`, `tool`)는 제거.

---

## 작업 체크리스트 (실행 순서)

1. [ ] apps.json: 새 카테고리 키 도입(`weather-road`, `realestate`, `daily-tool`, `learning`), 21개 앱 카테고리 재할당
2. [ ] apps.json: `featured`/`featuredEn` 필드 도입 + 위 표대로 마킹
3. [ ] apps.json: `showInEnglish: true` 명시 (camlocation, myweather)
4. [ ] apps.json: hidden:true 13개 일괄 적용
5. [ ] apps.json: MyWeatherTW 신규 추가
6. [ ] apps.json: 카테고리 내 수동 순서 보장 (배열 순서 또는 `order` 필드)
7. [ ] i18n.json: 새 카테고리 키 추가, 구 키 제거
8. [ ] index.njk: featured 섹션 + 4개 카테고리 섹션, sort by name 제거
9. [ ] en/index.njk: featuredEn 섹션 + 3개 카테고리 섹션(realestate 제외), showInEnglish 기본값 규칙 적용
10. [ ] 영어 페이지 신규 4개 생성: `src/en/myweathertw/`, `src/en/finedustmap/`, `src/en/iconmixer/`, `src/en/englishnumber/`
11. [ ] 한국어 페이지 신규 1개 확인·생성: `src/myweathertw/` (`src/finedustmap/`도 없으면 생성)
12. [ ] base.njk·layouts: 변경 사항 없음 (확인만)
13. [ ] 로컬 빌드 (`npm run build`) 확인 — 404 링크 없는지 점검
14. [ ] git commit & push → Cloudflare Pages 자동 배포
15. [ ] homepage CLAUDE.md 갱신 (현 8개 앱 → 21개 앱, 새 구조)

---

## 미해결 / 후속 결정 사항

1. **상세 페이지 콘텐츠**가 빈약한 앱들 — 어떤 앱부터 상세 페이지 살을 붙일지 우선순위.
2. **MyWeatherTW 정식 앱명** — "날씨비서 (대만)"이 적절한지 확인.
3. **FineDustMap의 ko 페이지** — 현재 src/finedustmap/ 디렉토리 존재 여부 확인 필요. 없으면 생성.
4. **EnglishNumber 영어 페이지 설명** — 한국어 학습자 대상이라는 점을 반영해 영어 카피 재작성 필요.

---

## 참고

- 원본 분류 파일: `/Users/cgkim/AndroidStudioProjects/main_projects.txt`
- 폐기 앱 목록: `/Users/cgkim/.claude/projects/-Users-cgkim-AndroidStudioProjects/memory/project_discontinued_apps.md`
- 홈페이지 운영 매뉴얼: `~/server/homepage/CLAUDE.md` (구버전, 8개 앱 기준 — 갱신 필요)
