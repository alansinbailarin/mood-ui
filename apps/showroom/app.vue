<script setup lang="ts">
import { resolveHash } from "~/utils/hash-redirects";

/**
 * Redirect legacy hash URLs (`mood-ui.com/#button`) to their Nuxt route
 * before the first paint. The hash is never sent to the server, so this
 * has to run on the client — but it has to run *early* so we don't
 * flash the landing page on the way to the canonical page. Hooking the
 * Nuxt app:created event runs us during hydration, before the route
 * resolves the first match.
 *
 * In-page anchors (e.g. `#ex-skeleton` set by the TOC scroll-spy) are
 * left alone: resolveHash() returns null for any id that isn't a known
 * component, doc or composable id.
 */
const router = useRouter();

if (import.meta.client && window.location.hash) {
  const target = resolveHash(window.location.hash);
  if (target) {
    const stripped = `${window.location.pathname}${window.location.search}`;
    // Only redirect if we're on `/` — preserve in-page anchors on
    // component pages (the user landed on /forms/button#api intentionally).
    if (stripped === "/" || stripped === "") {
      router.replace(target);
    }
  }
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
