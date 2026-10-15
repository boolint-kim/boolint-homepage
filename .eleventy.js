// 11ty 설정

// 영어 홈 노출 여부 (showInEnglish 명시값 우선, 미지정 시 koreaOnly의 반대)
function inEnglishHome(app) {
  if (app && app.showInEnglish !== undefined) return !!app.showInEnglish;
  return !(app && app.koreaOnly);
}

// 한국 홈 노출 여부 (showInKorean 명시값 우선, 미지정 시 노출)
// 영문 전용 앱(한국어 페이지가 없는 앱)은 showInKorean: false 로 뺀다
function inKoreanHome(app) {
  if (app && app.showInKorean !== undefined) return !!app.showInKorean;
  return true;
}

module.exports = function(eleventyConfig) {
  // 정적 파일 복사
  eleventyConfig.addPassthroughCopy("src/assets");

  // public/ 폴더 내용을 루트로 복사 (_headers, _redirects, robots.txt)
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  eleventyConfig.addFilter("inEnglishHome", inEnglishHome);
  eleventyConfig.addFilter("inKoreanHome", inKoreanHome);

  // slug 로 앱 하나 찾기 — 템플릿 안에서 for 루프로 찾으면 set 이 루프 밖으로 안 나온다
  eleventyConfig.addFilter("bySlug", function(apps, slug) {
    return (apps || []).find(a => a.slug === slug);
  });

  // 해당 언어 홈에 노출되는 앱만 (hidden 제외, apps.json 배열 순서 유지)
  eleventyConfig.addFilter("visibleIn", function(apps, lang) {
    return (apps || []).filter(a => !a.hidden && (lang === "en" ? inEnglishHome(a) : inKoreanHome(a)));
  });

  // 카테고리로 거르기
  eleventyConfig.addFilter("inCategory", function(apps, category) {
    return (apps || []).filter(a => a.category === category);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
