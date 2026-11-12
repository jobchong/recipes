---
name: publish-recipe
description: Turn a recipe URL (or pasted recipe text) into a page on elo-recipes.com and publish it by pushing to main. Use when the user says "publish", "add", or "save" a recipe with a link or pasted recipe, or writes /publish-recipe.
---

# Publish a recipe to elo-recipes.com

Input: a recipe URL, or a recipe the user pasted (for example a text card from their chat recipe skill). The goal is a new `src/recipes/<slug>.md` file pushed to `main`, so Cloudflare Pages builds and publishes it. Do not use drafts, branches, or PRs unless the user asks.

Follow `AGENTS.md` throughout.

## 1. Get the recipe

- URL: fetch the page with WebFetch. Prefer the page's `application/ld+json` Recipe data when present, and fall back to the visible recipe text. Skip the blog story, ads, and comments.
- Pasted text: use it as given. If it has no source link, ask once where it came from. If it is the user's own recipe, leave out `source`.
- Pasted `@recipe` text card (from the user's chat skill): `# Title`, `# Source: <url>`, `# Serves N · Prep X min · Cook Y min`, then `# Group` headers with ingredient lines, numbered steps, and an optional closing `#` note. Map it directly: the header gives `title`, `source.url`, `yield`, and `totalMinutes` (prep + cook). Each `# Group` becomes an `ingredients` group, the numbered lines become `steps`, and the closing note goes in `notes`. Its steps are already paraphrased, so keep them.
- If the page has no real recipe on it, such as a paywall, a video only, or a page that would not load, stop and tell the user. Do not reconstruct a recipe from memory.

## 2. Write it in this site's style

The site is public, so the page must not copy the source's prose.

This follows the user's `@recipe` card conventions.

- Ingredients: keep quantities exactly as given, amount first, with the knife work folded in (`2 garlic cloves, minced`). Group by what goes into the pan together, not by the site's headings (Aromatics, Sauce, Marinade, Slurry, To finish…). An ingredient added alone gets its own group (Oil, Tofu, Pork). Order the groups by first use. Note how divided ingredients are split (`– half stirred in, half garnish`). Account for every listed ingredient. If one never appears in the steps, place it where a cook would add it and mention that guess in your report.
- Steps: in strict cooking order, one action per step, short imperatives of about 15 words or fewer. Keep heat levels, times, and temperatures exact. Refer to groups by name rather than repeating amounts, except for partial quantities of divided ingredients. Use "Meanwhile," for prep that overlaps a wait. Keep load-bearing warnings (`Ease in the tofu gently – soft tofu breaks.`). Paraphrase everything and never reproduce the site's sentences. Do not add techniques the source does not use.
- Notes: only substitutions, make-ahead, or storage tips the source actually gives, reworded. Omit `notes` if there are none.
- Body: one or two sentences of your own describing the dish. No invented history, praise, or claims that it was tested.
- Never invent nutrition, ratings, authorship, or tested status. Never copy the source's photos. Leave out the image fields unless the user supplies their own photo.

## 3. Build the front matter

Copy the shape of `templates/recipe.md`:

- `title`: the dish name, sentence case.
- `description`: one sentence of your own, under about 140 characters.
- `date`: today's date, quoted (`'YYYY-MM-DD'`).
- No `draft`, `example`, or `placeholder` field.
- `totalMinutes`: a whole number (prep + cook) from the source. This is required for the Recipe schema. If the source does not state a time, estimate it from the steps and say in your report that it is an estimate.
- `yield`: as the source states it (e.g. `4 servings`).
- `ingredientTags`: two to four main ingredients. Reuse existing labels first; list them with
  `grep -h -A8 '^ingredientTags:' src/recipes/*.md | grep '^  - ' | sort -u`.
- `occasions`: one or two, reusing existing labels (`Weeknight dinners`, `Something to share`, `Slow weekends`, `Cooking for two`). Add a new one only when none fits.
- `source`: `name` is the author or site name, `url` is the original page. Required for anything taken from a URL.
- `ingredients`, `steps`, `notes`: as in step 2.

Slug: a short kebab-case version of the dish name, e.g. `lemon-garlic-chicken-thighs`. The filename is the permanent URL. If `src/recipes/<slug>.md` already exists, do not overwrite it: ask the user, or pick a more specific slug.

If an existing photo placeholder (`placeholder: true`) is clearly the same dish, ask the user whether to fill that page instead. If they agree, keep its filename and image fields, remove `placeholder: true`, and replace the rest.

## 4. Check and publish

1. `git pull --rebase origin main` first, so the push won't be rejected.
2. Run `npm run check`. Fix any failure and run it again. Never push a failing build.
3. Commit only the new or changed recipe file: `git add src/recipes/<slug>.md`, with the message `Add recipe: <title>` plus the attribution lines the session requires.
4. `git push origin main`.

## 5. Wait for the live page

Cloudflare Pages deploys `main` in about a minute. Before reporting, wait until the page actually serves, so the link never opens on a 404:

```bash
url="https://elo-recipes.com/recipes/<slug>/"
for i in $(seq 1 30); do [ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "$url")" = 200 ] && break; sleep 10; done
curl -s -o /dev/null -w '%{http_code}\n' --max-time 8 "$url"
```

If it still isn't 200 after about 5 minutes, say so and give the link anyway.

## 6. Hand over the link

The user often runs this from their phone. You cannot open a tab on their device, so make the link a single tap away:

1. Send a `PushNotification` (load it with ToolSearch if it's deferred) whose message is the recipe title and the full URL, e.g. `Published: Mapo tofu https://elo-recipes.com/recipes/mapo-tofu/`. It only reaches the phone when Remote Control is on and the user isn't watching; a "not sent" result is fine.
2. Start the final message with the live URL as a clickable Markdown link on its own line: `[<title>](https://elo-recipes.com/recipes/<slug>/)`.
3. Then, briefly: the source credited, and anything you estimated or left out (time, yield, notes).
