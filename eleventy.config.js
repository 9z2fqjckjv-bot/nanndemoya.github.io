module.exports = function(eleventyConfig) {
  // Passthrough copy for assets and media
  eleventyConfig.addPassthroughCopy("src/**/*.css");
  eleventyConfig.addPassthroughCopy("src/**/*.js");
  eleventyConfig.addPassthroughCopy("src/**/*.pdf");
  eleventyConfig.addPassthroughCopy("src/**/*.mp4");
  eleventyConfig.addPassthroughCopy("src/**/*.png");
  eleventyConfig.addPassthroughCopy("src/**/*.jpg");
  eleventyConfig.addPassthroughCopy("src/**/*.key");
  eleventyConfig.addPassthroughCopy("src/**/*.numbers");
  eleventyConfig.addPassthroughCopy("src/**/*.docx");
  eleventyConfig.addPassthroughCopy("src/**/*.xlsx");
  eleventyConfig.addPassthroughCopy("src/**/*.md");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/CNAME");

  // ルート配置の公開資産（現行GitHub Pages構成との併用）
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("document");
  eleventyConfig.addPassthroughCopy("lead-form-popup.js");
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("CNAME");

  // Create search index collection
  eleventyConfig.addCollection("searchIndex", function(collectionApi) {
    const pages = collectionApi.getAll().filter(item => item.url && item.url.endsWith('.html'));
    return pages.map(page => {
      let text = page.rawInput || "";
      text = text.replace(/<[^>]*>?/gm, ' ');
      text = text.replace(/\s+/g, ' ').trim();
      return {
        title: page.data.title || "",
        url: page.url,
        text: text
      };
    });
  });

  return {
    templateFormats: ["html", "njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dir: {
      input: "src",
      includes: "../_includes",
      output: "_site"
    },
    pathPrefix: "/"
  };
};
