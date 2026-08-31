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

  // Create search index collection
  eleventyConfig.addCollection("searchIndex", function(collectionApi) {
    const pages = collectionApi.getAll().filter(item => item.url && item.url.endsWith('.html'));
    return pages.map(page => {
      // Avoid templateContent early access error by using rawInput
      let text = page.rawInput || "";
      text = text.replace(/<[^>]*>?/gm, ' '); // remove tags
      text = text.replace(/\s+/g, ' ').trim(); // normalize whitespace
      return {
        title: page.data.title || "",
        url: page.url,
        text: text
      };
    });
  });

  return {
    templateFormats: ["html", "njk"],
    dir: {
      input: "src",
      output: "_site"
    },
    pathPrefix: "/"
  };
};
