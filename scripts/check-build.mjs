import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL("../_site/", import.meta.url));
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const pages = walk(output).filter((path) => path.endsWith(".html"));
assert(pages.length > 0, "No HTML pages were built.");
let recipeCount = 0;
for (const path of pages) {
  const html = readFileSync(path, "utf8");
  const name = relative(output, path);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${name}: expected one page heading`);
  assert.match(html, /<title>[^<]+<\/title>/, `${name}: missing title`);
  assert.match(html, /<meta name="description" content="[^"]+">/, `${name}: missing description`);
  const pageUrl = new URL(name.replace(/index\.html$/, ""), "https://check.invalid/");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replace(/&amp;/g, "&");
    const url = new URL(href, pageUrl);
    if (url.origin !== pageUrl.origin) continue;
    const pathname = decodeURIComponent(url.pathname);
    let target = resolve(output, `.${pathname}`);
    assert(target === resolve(output) || target.startsWith(resolve(output) + sep), `${name}: link escapes output: ${href}`);
    if (pathname.endsWith("/")) target = join(target, "index.html");
    assert(existsSync(target), `${name}: broken local link or asset: ${href}`);
    if (url.hash && target.endsWith(".html")) {
      const targetHtml = target === path ? html : readFileSync(target, "utf8");
      assert(targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${name}: missing anchor: ${href}`);
    }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(match[0], /\balt="[^"]+"/, `${name}: image needs alt text`);
    assert.match(match[0], /\bwidth="\d+"/, `${name}: image needs dimensions`);
    assert.match(match[0], /\bheight="\d+"/, `${name}: image needs dimensions`);
  }
  const structuredData = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (structuredData) {
    const recipe = JSON.parse(structuredData[1]);
    assert.equal(recipe["@type"], "Recipe");
    assert(recipe.recipeIngredient.length > 0 && recipe.recipeInstructions.length > 0, `${name}: incomplete recipe schema`);
    assert.match(recipe.totalTime, /^PT\d+M$/);
    assert(html.includes('id="recipe"'), `${name}: recipe anchor missing`);
    if (html.includes('class="example-note"')) assert(html.includes('content="noindex, nofollow"'), `${name}: sample recipes must not be indexed`);
    recipeCount++;
  }
}
for (const file of ["404.html", "robots.txt", "sitemap.xml", "assets/style.css", "assets/recipe.js"]) {
  assert(existsSync(join(output, file)), `Missing ${file}`);
}
console.log(`Checked ${pages.length} pages and ${recipeCount} recipes: internal links, anchors, images, metadata and recipe schema are valid.`);
