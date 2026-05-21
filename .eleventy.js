// 11ty 설정
module.exports = function(eleventyConfig) {
  // 정적 파일 복사
  eleventyConfig.addPassthroughCopy("src/assets");

  // public/ 폴더 내용을 루트로 복사 (_headers, _redirects, robots.txt)
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // 영어 홈 노출 여부 (showInEnglish 명시값 우선, 미지정 시 koreaOnly의 반대)
  eleventyConfig.addFilter("inEnglishHome", function(app) {
    if (app && app.showInEnglish !== undefined) return !!app.showInEnglish;
    return !(app && app.koreaOnly);
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
