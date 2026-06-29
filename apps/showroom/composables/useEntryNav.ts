import { allEntries } from "~/utils/nav-manifest";

/**
 * Locale-aware navigation to a nav-manifest entry id OR a raw path. Replaces a
 * go() helper that was copy-pasted across the home + docs pages. localePath()
 * keeps the user in their current locale under prefix_except_default (it returns
 * the path unchanged for the default English locale, and prefixes "/es" for
 * Spanish).
 */
export function useEntryNav() {
  const router = useRouter();
  const localePath = useLocalePath();
  return (idOrPath: string) => {
    if (idOrPath.startsWith("/")) return router.push(localePath(idOrPath));
    const entry = allEntries.find((e) => e.id === idOrPath);
    if (entry) router.push(localePath(entry.route));
  };
}
