export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('WebLogo1.gif');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('favicon.gif');
  eleventyConfig.addWatchTarget('src/');

  // Filter items in a collection by a nested key matching a value.
  // Usage: collections.all | filter("data.layout", "layouts/project.njk")
  eleventyConfig.addFilter('filter', (arr, keyPath, value) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => {
      const v = keyPath.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), item);
      return v === value;
    });
  });

  // Sort projects by year descending (string compare on the leading 4 chars works for "2023", "2019–2025", etc).
  eleventyConfig.addFilter('sortByPlaceYear', (arr) => {
    return [...arr].sort((a, b) => {
      const ay = String(a.data.year || '').slice(0, 4);
      const by = String(b.data.year || '').slice(0, 4);
      return by.localeCompare(ay);
    });
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
}
