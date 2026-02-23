// 11ty 설정
module.exports = function(eleventyConfig) {
  // 정적 파일 복사
  eleventyConfig.addPassthroughCopy("src/assets");

  // public/ 폴더 내용을 루트로 복사 (_headers, _redirects, robots.txt)
  eleventyConfig.addPassthroughCopy({ "public": "/" });

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
