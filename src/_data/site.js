// Set the final name, author and canonical origin here before publishing.
// An empty origin keeps the preview out of search engines and omits canonical URLs.
const canonicalOrigin = "";
const url = (process.env.SITE_URL || canonicalOrigin).replace(/\/$/, "");
if (url && (new URL(url).origin !== url || !url.startsWith("https://"))) {
  throw new Error("SITE_URL must be an HTTPS origin without a path, e.g. https://recipes.example.com");
}
export default {
  name: "At the table",
  description: "A collection of recipes for everyday cooking and the people around your table.",
  author: "",
  url,
};
