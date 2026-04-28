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

  // Sort projects by year descending. For ranges like "2019–2025" we use the
  // most recent year (the last 4-digit run) so ongoing series rank high.
  eleventyConfig.addFilter('sortByPlaceYear', (arr) => {
    const lastYear = (s) => {
      const matches = String(s || '').match(/\d{4}/g);
      return matches ? matches[matches.length - 1] : '';
    };
    return [...arr].sort((a, b) => lastYear(b.data.year).localeCompare(lastYear(a.data.year)));
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
