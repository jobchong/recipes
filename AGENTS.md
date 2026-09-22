# Working on this recipe site

- Keep this a static Eleventy site. Do not introduce a client framework, CMS, database, remote fonts, analytics, or a service without a concrete requirement.
- Recipes live in `src/recipes/<slug>.md`; copy `templates/recipe.md`. The filename is the permanent URL. Preserve existing URLs unless explicitly asked to change them.
- Recipe prose belongs in the Markdown body, structured ingredients/method/notes in front matter. Reuse existing ingredient and occasion labels where appropriate; indexes are generated automatically.
- Do not invent authorship, ratings, nutrition, tested status, or source credit. Attribute adaptations when the user supplies a source.
- The initial three recipes and photographs are examples. Replace or remove them when real content arrives. Do not imply that the user wrote or tested them.
- `draft: true` excludes a recipe from both output and collections. Remove it only when ready to publish. `example: true` is a visible sample marker and adds noindex; it does not hide a page.
- Images are optional. Use local, reasonably compressed assets, accurate alt text, and declared dimensions. Do not add runtime image services.
- The site name, author, and canonical URL are in `src/_data/site.js`; the editable foreword is `src/_includes/foreword.md`.
- Run `npm run check` after content or template changes. For layout changes, also check a narrow viewport and a recipe page in the browser. Check print styles if the recipe layout changes.
- Cloudflare Pages builds `main` with `npm run check` and publishes `_site`. Keep deployment through its Git integration, not a second deploy workflow. Never enable GitHub Pages in this repo to work around a Cloudflare issue.
- Never edit `_site` directly or commit generated output, dependencies, credentials, or personal account identifiers.
