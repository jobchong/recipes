export default {
  layout: "layouts/recipe.njk",
  section: "recipes",
  eleventyComputed: {
    permalink: (data) => data.draft ? false : `/recipes/${data.page.fileSlug}/`,
    eleventyExcludeFromCollections: (data) => Boolean(data.draft),
  },
};
