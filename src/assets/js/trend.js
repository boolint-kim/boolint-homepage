// 뜨는영상 웹 — 카테고리별로 "안 본 것"을 골라내는 화면.
//
// 크롬 확장이 이 파일을 그대로 복사해 쓴다. 그래서 두 가지를 지킨다:
//   1) inline 핸들러·innerHTML 주입 없음 — MV3 CSP 가 인라인 실행을 막는다
//   2) 페이지 구조 의존 최소화 — 진입점은 TrendApp.mount(root) 하나
//
// 정책 (구현계획서 §8):
//   - 순위 번호를 노출하지 않는다. 서버가 준 순서를 바꾸지 않는다(III.E.2)
//   - 썸네일은 i.ytimg.com 표준 URL 을 핫링크만 한다. 저장·재가공하지 않는다
//   - 로컬 캐시·시청기록은 30일 만료(III.E.4.c)
(function (global) {
  "use strict";

  var API_URL = "https://youtube-pool.boolint.com/v1/ranking/index";
  var BANNER_URL = "https://selfbanner.boolint.com/banners.json";

  // 서버 SHORTS_MAX_SEC 와 같은 기준. 카드 비율 분기에도 그대로 쓴다(§3-1-1 부록 A-3).
  // 3분 이하를 세로로 보면 479건 중 465건(97.1%)이 맞는다.
  var SHORTS_MAX_SEC = 180;

  var TTL_MS = 30 * 24 * 60 * 60 * 1000; // 캐시·시청기록 공통 30일

  var K_CACHE = "trend.cache";
  var K_WATCHED = "trend.watched";
  var K_NEW = "trend.new";
  var K_HIDE = "trend.hideWatched";

  // ─────────────────────────────────────────────────────────── 저장소
  // 사파리 프라이빗 모드 등에서 localStorage 접근 자체가 던진다. 저장이 안 되는 것은
  // 기능 저하일 뿐 화면이 죽을 일은 아니라 전부 삼킨다.
  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 용량 초과·프라이빗 모드 — 무시 */
    }
  }

  // 탭한 영상 { videoId: 눌린시각 }. 30일 지난 항목은 읽을 때 걸러낸다 —
  // 차트가 2~5일이면 물갈이되므로 오래된 기록은 의미가 없다(§4).
  function loadWatched() {
    var raw = read(K_WATCHED, {});
    var now = Date.now();
    var out = {};
    var dirty = false;
    for (var id in raw) {
      if (!Object.prototype.hasOwnProperty.call(raw, id)) continue;
      if (now - raw[id] < TTL_MS) out[id] = raw[id];
      else dirty = true;
    }
    if (dirty) write(K_WATCHED, out);
    return out;
  }

  // ─────────────────────────────────────────────────────────── 데이터
  function parse(body) {
    var data = JSON.parse(body);
    if (!data || !data.categories) return null;
    // count=0 카테고리는 탭을 만들지 않는다(§2). 순서는 서버가 준 그대로 둔다.
    data.categories = data.categories.filter(function (c) {
      return c.items && c.items.length > 0;
    });
    return data.categories.length ? data : null;
  }

  function loadCache() {
    var hit = read(K_CACHE, null);
    if (!hit || !hit.body) return null;
    if (Date.now() - hit.savedAt > TTL_MS) return null;
    try {
      return parse(hit.body);
    } catch (e) {
      return null;
    }
  }

  // 새 스냅샷과 직전 스냅샷의 videoId 를 비교해 NEW 를 정한다(§5).
  // 최초 방문(이전 스냅샷 없음)에는 아무것도 NEW 로 치지 않는다 — 전부에 뱃지가 붙으면 소음이다.
  function diffNew(fresh) {
    var prev = read(K_NEW, null);
    if (prev && prev.updatedAt === fresh.updatedAt) return prev.ids || [];

    var prevIds = read(K_CACHE, null);
    var known = {};
    var hadPrev = false;
    if (prevIds && prevIds.body) {
      try {
        var old = JSON.parse(prevIds.body);
        (old.categories || []).forEach(function (c) {
          (c.items || []).forEach(function (v) {
            known[v.videoId] = 1;
          });
        });
        hadPrev = true;
      } catch (e) {
        /* 깨진 캐시 — 최초 방문으로 친다 */
      }
    }

    var ids = [];
    if (hadPrev) {
      fresh.categories.forEach(function (c) {
        c.items.forEach(function (v) {
          if (!known[v.videoId]) ids.push(v.videoId);
        });
      });
    }
    write(K_NEW, { updatedAt: fresh.updatedAt, ids: ids });
    return ids;
  }

  // ─────────────────────────────────────────────────────────── 화면
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text; // 제목·채널명은 항상 textContent 로 넣는다
    return node;
  }

  function thumbUrl(videoId, variant) {
    return "https://i.ytimg.com/vi/" + videoId + "/" + variant + ".jpg";
  }

  function formatUpdated(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    // 서버가 KST 04:00·16:00 에 갱신한다. 보는 사람 기준이 아니라 갱신 리듬을 보여주는 값이라
    // 로컬 타임존이 아닌 KST 로 고정해 표기한다.
    var kst = new Date(d.getTime() + 9 * 3600 * 1000);
    var mm = kst.getUTCMonth() + 1;
    var dd = kst.getUTCDate();
    var hh = String(kst.getUTCHours()).padStart(2, "0");
    var mi = String(kst.getUTCMinutes()).padStart(2, "0");
    return mm + "/" + dd + " " + hh + ":" + mi;
  }

  function TrendApp(root) {
    this.root = root;
    this.data = null;
    this.newIds = {};
    this.watched = loadWatched();
    this.hideWatched = read(K_HIDE, false) === true;
    this.activeId = null;
    this.columns = [];
  }

  TrendApp.prototype.$ = function (id) {
    return this.root.querySelector('[data-tv="' + id + '"]');
  };

  TrendApp.prototype.mount = function () {
    var self = this;

    this.$("hide").checked = this.hideWatched;
    this.$("hide").addEventListener("change", function () {
      self.hideWatched = this.checked;
      write(K_HIDE, self.hideWatched);
      self.renderGrid();
    });

    this.$("retry").addEventListener("click", function () {
      self.setState("loading");
      self.fetchFresh();
    });

    // 폭이 바뀌면 컬럼 수가 달라진다. 리사이즈마다 전부 다시 그리면 무거우니 디바운스한다.
    var timer = null;
    global.addEventListener("resize", function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        self.renderGrid();
      }, 150);
    });

    // 캐시가 있으면 먼저 그린다. 네트워크를 기다렸다 그리면 캐시가 있어도
    // 0.5~2초 빈 화면을 보게 된다(§3-3 에서 앱이 겪은 것과 같은 함정).
    var cached = loadCache();
    if (cached) {
      this.data = cached;
      this.newIds = toSet(read(K_NEW, { ids: [] }).ids || []);
      this.render();
    } else {
      this.setState("loading");
    }

    this.fetchFresh();
    this.loadBanner();
  };

  function toSet(list) {
    var out = {};
    (list || []).forEach(function (id) {
      out[id] = 1;
    });
    return out;
  }

  TrendApp.prototype.setState = function (state) {
    this.root.setAttribute("data-state", state);
  };

  TrendApp.prototype.fetchFresh = function () {
    var self = this;
    fetch(API_URL, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (body) {
        var fresh = parse(body);
        if (!fresh) throw new Error("빈 응답");

        // NEW 판정은 캐시를 덮어쓰기 전에만 가능하다(§5) — 순서를 바꾸면 안 된다.
        self.newIds = toSet(diffNew(fresh));
        write(K_CACHE, { body: body, savedAt: Date.now() });

        self.data = fresh;
        self.render();
      })
      .catch(function (e) {
        // 캐시로 이미 그려져 있으면 조용히 둔다 — 오프라인에서도 화면은 살아 있어야 한다
        if (!self.data) self.setState("error");
      });
  };

  TrendApp.prototype.render = function () {
    this.$("updated").textContent = formatUpdated(this.data.updatedAt);
    this.renderTabs();
    this.renderGrid();
    this.setState("ready");
  };

  TrendApp.prototype.renderTabs = function () {
    var self = this;
    var bar = this.$("tabs");
    bar.textContent = "";

    // 보던 카테고리가 사라졌으면 첫 번째로 되돌린다(건수가 널뛰어 탭이 없어질 수 있다 §3-2)
    var ids = this.data.categories.map(function (c) {
      return c.id;
    });
    if (ids.indexOf(this.activeId) === -1) this.activeId = ids[0];

    this.data.categories.forEach(function (cat) {
      var btn = el("button", "tv-tab", cat.name);
      btn.type = "button";
      if (cat.id === self.activeId) btn.classList.add("is-active");
      btn.addEventListener("click", function () {
        self.activeId = cat.id;
        self.renderTabs();
        self.renderGrid();
        self.$("grid").scrollIntoView({ block: "start", behavior: "smooth" });
      });
      bar.appendChild(btn);
    });
  };

  TrendApp.prototype.current = function () {
    var self = this;
    var found = null;
    this.data.categories.forEach(function (c) {
      if (c.id === self.activeId) found = c;
    });
    return found;
  };

  TrendApp.prototype.renderGrid = function () {
    if (!this.data) return;
    var self = this;
    var cat = this.current();
    var grid = this.$("grid");
    grid.textContent = "";

    var items = cat.items.filter(function (v) {
      return !(self.hideWatched && self.watched[v.videoId]);
    });

    if (!items.length) {
      grid.appendChild(el("p", "tv-empty", "이 카테고리는 다 보셨습니다. '본 것 숨기기'를 끄면 다시 볼 수 있어요."));
      return;
    }

    // 카드 높이가 9:16 과 16:9 로 섞여서 균등 그리드로는 짧은 카드 아래가 크게 빈다.
    // 안드로이드가 StaggeredGridLayoutManager 로 푼 것과 같은 문제라, 여기서는
    // "가장 짧은 컬럼에 넣기"로 채운다. 컬럼 안에서는 서버 순서가 유지된다(§8).
    var colCount = self.columnCount();
    var cols = [];
    var heights = [];
    for (var i = 0; i < colCount; i++) {
      var col = el("div", "tv-col");
      cols.push(col);
      heights.push(0);
      grid.appendChild(col);
    }

    items.forEach(function (video) {
      var shortForm = video.durationSec > 0 && video.durationSec <= SHORTS_MAX_SEC;
      var target = 0;
      for (var i = 1; i < heights.length; i++) {
        if (heights[i] < heights[target]) target = i;
      }
      cols[target].appendChild(self.card(video, shortForm));
      // 실측 대신 비율로 누적한다. 제목 줄수 차이는 무시할 만하고,
      // 이미지 로딩 전에 확정할 수 있어 레이아웃이 흔들리지 않는다.
      heights[target] += shortForm ? 16 / 9 : 9 / 16;
    });
  };

  TrendApp.prototype.columnCount = function () {
    var w = this.root.clientWidth || global.innerWidth;
    if (w >= 1000) return 4;
    if (w >= 700) return 3;
    return 2;
  };

  TrendApp.prototype.card = function (video, shortForm) {
    var self = this;

    var a = el("a", "tv-card");
    a.href = "https://www.youtube.com/watch?v=" + video.videoId;
    a.target = "_blank";
    a.rel = "noopener";
    if (this.watched[video.videoId]) a.classList.add("is-watched");

    var thumb = el("div", "tv-card__thumb");
    thumb.style.aspectRatio = shortForm ? "9 / 16" : "16 / 9";

    var img = el("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = "";
    img.src = thumbUrl(video.videoId, "maxresdefault");
    // maxresdefault 가 없는 영상이 있다. 한 번만 hqdefault 로 내려가고 멈춘다(무한 루프 방지)
    img.addEventListener("error", function () {
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = thumbUrl(video.videoId, "hqdefault");
    });
    thumb.appendChild(img);

    if (this.newIds[video.videoId]) thumb.appendChild(el("span", "tv-badge tv-badge--new", "NEW"));
    thumb.appendChild(el("span", "tv-badge tv-badge--seen", "본 영상"));

    a.appendChild(thumb);
    a.appendChild(el("div", "tv-card__title", video.title));
    a.appendChild(el("div", "tv-card__channel", video.channelTitle));

    // 유튜브로 나간 뒤 실제 시청 여부는 알 수 없다 — 탭을 시청으로 친다(§4).
    // videoId 전역으로 기록한다. 같은 영상이 2~3개 카테고리에 동시에 뜨기 때문이다.
    a.addEventListener("click", function () {
      self.watched[video.videoId] = Date.now();
      write(K_WATCHED, self.watched);
      a.classList.add("is-watched");
    });

    return a;
  };

  // ─────────────────────────────────────────────────────────── 셀프배너
  // 안드로이드·iOS 는 SelfBanner 라이브러리를 쓰지만 웹은 없어서 직접 그린다.
  // 데이터·도메인은 같으므로 통계가 한쪽으로 모인다.
  TrendApp.prototype.loadBanner = function () {
    var self = this;
    fetch(BANNER_URL)
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        var list = (data && (data.banners || data)) || [];
        if (!Array.isArray(list) || !list.length) return;

        var pick = list[Math.floor(Math.random() * list.length)];
        var url = pick.linkUrl || pick.link || pick.url;
        var image = pick.imageUrl || pick.image;
        if (!url || !image) return;

        var slot = self.$("banner");
        var a = el("a", "tv-banner");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        var img = el("img");
        img.src = image;
        img.alt = pick.title || "";
        img.loading = "lazy";
        a.appendChild(img);
        slot.appendChild(a);
      })
      .catch(function () {
        /* 배너는 없어도 그만이다 */
      });
  };

  global.TrendApp = {
    mount: function (root) {
      var app = new TrendApp(root);
      app.mount();
      return app;
    },
  };

  // 자동 마운트. 인라인 <script> 를 쓰지 않으려는 것이다 —
  // 크롬 확장(MV3)은 CSP 가 인라인 실행을 막아서, 페이지가 이 파일만 불러오면 되게 만든다.
  function boot() {
    var root = document.querySelector(".tv");
    if (root) global.TrendApp.mount(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
