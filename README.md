# At the table

A small, static recipe notebook. Eleventy turns Markdown recipes into plain HTML; one shared stylesheet supplies the layout. There is no database, CMS, application server, client framework, remote font, or runtime API. The only browser JavaScript is a tiny optional print button. Reading, browsing, jumping to the recipe, and ticking ingredients all work without it.

## Local development

Use Node 22 or later (`nvm use` selects the version in `.nvmrc`).

```sh
npm ci
npm run dev
```

Open the local address printed by Eleventy (normally http://localhost:8080). Changes reload automatically.

```sh
npm run check
```

This performs a clean build and verifies the generated internal links, anchors, image references, page metadata, and Recipe JSON-LD. The finished site is `_site/`; any static web host can serve it.

## Add a recipe

1. Copy `templates/recipe.md` to `src/recipes/your-recipe-name.md`.
2. Fill in the front matter: title, card description, date, total time in minutes, yield, ingredient/occasion labels, ingredient groups, method, and optional notes. Use a date in `YYYY-MM-DD` form. Recipes appear newest first.
3. Write the introductory blurb below the front matter in ordinary Markdown.
4. Optionally put a compressed photograph in `src/assets/images/` and set `image` and `imageAlt`. Aim for a 4:3 image, about 1200 × 900 pixels and under 300 KB. A recipe without a photograph is supported too.
5. Remove `draft: true` when ready and run `npm run check`.
6. Commit and push to `main`. Once Cloudflare is connected, that push publishes the update.

The filename becomes `/recipes/your-recipe-name/`. Ingredients and occasions automatically get index pages and recipe lists; no other file needs editing. Tag only the main ingredients people would browse for, rather than every pinch of salt. Reuse existing label spellings (e.g. `Spring onions`) to keep the index tidy.

`draft: true` omits a recipe entirely. Production builds clean old output so a deleted or newly drafted recipe does not remain published. `example: true` marks a visible sample recipe and tells search engines not to index its detail page. These are different flags.

Recipe fields use plain text; only the introductory body uses Markdown. For front matter containing a colon followed by a space, use a YAML block scalar:

```yaml
notes:
  - >-
    Make ahead: prepare the sauce the day before.
```

## Edit the site

- Name, description, optional author, canonical origin: `src/_data/site.js`.
- Foreword: `src/_includes/foreword.md`.
- Homepage heading and layout: `src/index.njk`.
- Shared header and footer: `src/_includes/layouts/base.njk`.
- Recipe layout and print formatting: `src/_includes/layouts/recipe.njk` and `src/assets/style.css`.

The working name is **At the table**. The foreword is starter copy. Three **sample recipes** and their AI-generated illustrative photographs show the design; they are not supplied or kitchen-tested by the owner. Replace or remove them before launching the real collection. Image provenance is in `ASSETS.md`. No prose or images were copied from the reference sites.

## Publish automatically with Cloudflare Pages

Cloudflare's native Git integration is the deployment pipeline. Your existing personal GitHub Pages site is unaffected. There is no deploy token to maintain and no second GitHub deployment workflow.

One-time setup, once ready to publish:

1. In Cloudflare **Workers & Pages**, create a **Pages** project using **Connect to Git** and select `jobchong/recipes`. Authorize the Cloudflare GitHub integration for this repository if prompted.
2. Use these settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Framework | Eleventy (or None with the explicit values below) |
   | Build command | `npm run check` |
   | Build output directory | `_site` |
   | Root directory | Leave empty (repository root) |
   | Node version | `22` (also pinned in `.nvmrc`) |

3. Save and deploy. Every subsequent **push or merged pull request to `main`** builds, checks, and publishes automatically. A local commit alone cannot trigger remote deployment. A failed build/check does not replace the last successful production deployment. Other branches can receive Cloudflare preview deployments.
4. In the Pages project's **Custom domains**, add the domain you choose in Cloudflare and follow its DNS setup. Associate the domain in Pages before manually adding a DNS record.
5. Set the production environment variable `SITE_URL` to the final origin, such as `https://your-domain.example` (no trailing slash or path), and rebuild. Set this only in **Production**, leaving Preview unset. Alternatively edit `canonicalOrigin` in `src/_data/site.js` if you prefer to keep the production origin in Git (this also applies that origin to preview builds).

Until `SITE_URL` is set, pages include `noindex` and `robots.txt` disallows crawling. Once configured, real pages have canonical URLs and appear in `sitemap.xml`; sample recipe pages retain `noindex`. Recipe pages include structured Recipe data without invented ratings or nutrition. The optional author field should be set before launch for accurate authorship metadata.

The GitHub Actions workflow runs the same checks for pull requests and pushes to `main`. **It checks the site; Cloudflare publishes it.** Cloudflare does not wait for GitHub Actions, so the check runs in the Cloudflare build too. The one-time Cloudflare/GitHub connection and domain binding are account settings, not something a repository file can establish by itself.

Official instructions: [Eleventy on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-eleventy-site/), [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## Why this architecture

Handwritten HTML would duplicate the navigation, recipe layouts, and category indexes every time a recipe is added. Eleventy is the single build-time dependency and handles those jobs while delivering the same static files. Markdown keeps future recipes easy to supply, review, and edit in Git. Browsing uses ordinary links; the small initial collection does not need a search service or client-side filtering.

The visual references informed the personal introductions, editorial type, food-led recipe index, and practical recipe layout: [Alison Roman](https://www.alisoneroman.com), [Smitten Kitchen](https://smittenkitchen.com), [Singapore Noodles](https://sgpnoodles.substack.com), and [NYT Cooking](https://cooking.nytimes.com/recipes/11323-polenta-with-parmesan-and-olive-oil-fried-eggs).
