/**
 * Loads the markdown of a Kit page. Each file is its own lazy chunk, so a
 * static generate reads them on the server and the browser fetches none.
 */
import type { KitPage } from "./kit-nav";

const kitFiles = import.meta.glob("../content/kit/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const siteFiles = import.meta.glob("../content/kit-site/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export async function loadKitSource(page: KitPage): Promise<string> {
  const key =
    page.source === "kit"
      ? `../content/kit/${page.file}`
      : `../content/kit-site/${page.file}`;
  const loader = (page.source === "kit" ? kitFiles : siteFiles)[key];
  if (!loader) throw new Error(`Kit page source not found: ${key}`);
  return loader();
}
