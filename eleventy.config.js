import { existsSync } from "node:fs";
import { EleventyRenderPlugin } from "@11ty/eleventy";

const slugify = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const publicRecipes = (api) => api.getFilteredByGlob("src/recipes/*.md").filter((recipe) => !recipe.data.draft).sort((a, b) => b.date - a.date || a.data.title.localeCompare(b.data.title));

function validateRecipe({ data, inputPath }) {
  const fail = (message) => { throw new Error(`${inputPath}: ${message}`); };
  for (const key of ["title", "description", "yield"]) {
    if (typeof data[key] !== "string" || !data[key].trim()) fail(`Provide ${key}.`);
  }
  if (!Number.isInteger(data.totalMinutes) || data.totalMinutes <= 0) fail("totalMinutes must be a positive whole number.");
  for (const key of ["ingredientTags", "occasions", "ingredients", "steps"]) {
    if (!Array.isArray(data[key]) || !data[key].length) fail(`Provide a nonempty ${key} list.`);
  }
  for (const key of ["ingredientTags", "occasions"]) {
    if (data[key].some((tag) => typeof tag !== "string" || !slugify(tag))) fail(`${key} must contain usable text labels.`);
  }
  for (const group of data.ingredients) {
    if (!Array.isArray(group.items) || !group.items.length || group.items.some((item) => typeof item !== "string")) fail("Each ingredient group needs a list of text items.");
  }
  if (data.steps.some((step) => typeof step !== "string")) fail("Steps must be text.");
  if (data.notes && (!Array.isArray(data.notes) || data.notes.some((note) => typeof note !== "string"))) fail("Notes must be a list of text.");
  if (data.image && (!data.image.startsWith("/assets/images/") || !existsSync(`src${data.image}`) || !data.imageAlt)) fail("An image needs a local /assets/images/ file and imageAlt text.");
}

function taxonomy(api, field) {
  const groups = new Map();
  for (const recipe of publicRecipes(api)) {
    for (const name of new Set(recipe.data[field])) {
      const slug = slugify(name);
      const group = groups.get(slug) || { name, slug, recipes: [] };
      if (group.name !== name) throw new Error(`Use one spelling for the category “${name}” / “${group.name}”.`);
      group.recipes.push(recipe);
      groups.set(slug, group);
    }
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });
  eleventyConfig.addCollection("recipes", (api) => {
    const recipes = publicRecipes(api);
    recipes.forEach(validateRecipe);
    return recipes;
  });
  eleventyConfig.addCollection("ingredients", (api) => taxonomy(api, "ingredientTags"));
  eleventyConfig.addCollection("occasions", (api) => taxonomy(api, "occasions"));
  eleventyConfig.addFilter("slug", slugify);
  eleventyConfig.addFilter("firstItems", (items, count) => items.slice(0, count));
  eleventyConfig.addFilter("recipeCount", (count) => `${count} recipe${count === 1 ? "" : "s"}`);
  eleventyConfig.addFilter("absoluteUrl", (path, origin) => new URL(path, origin).href);
  eleventyConfig.addFilter("recipeSchema", (data, site, url) => JSON.stringify({
    "@context": "https://schema.org", "@type": "Recipe",
    name: data.title, description: data.description,
    ...(site.author ? { author: { "@type": "Person", name: site.author } } : {}),
    ...(site.url ? { url: new URL(url, site.url).href } : {}),
    ...(site.url && data.image ? { image: [new URL(data.image, site.url).href] } : {}),
    totalTime: `PT${data.totalMinutes}M`, recipeYield: data.yield,
    recipeCategory: data.occasions,
    keywords: [...data.ingredientTags, ...data.occasions].join(", "),
    recipeIngredient: data.ingredients.flatMap((group) => group.items),
    recipeInstructions: data.steps.map((text) => ({ "@type": "HowToStep", text })),
  }).replace(/</g, "\\u003c"));
  return { dir: { input: "src", output: "_site" }, markdownTemplateEngine: false, htmlTemplateEngine: "njk" };
}
