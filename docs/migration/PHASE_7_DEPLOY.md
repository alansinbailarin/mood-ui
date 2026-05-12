# Fase 7 — Deploy a producción + Google Search Console

Plan paso a paso para llevar la migración Nuxt 4 SSG de `feat/nuxt-migration`
a producción en `mood-ui.com`. Todos los pasos son acciones humanas
(merge, deploy, Search Console). Estimación total: **½ día de trabajo
real, 1-2 semanas de observación post-deploy.**

Branch actual: `feat/nuxt-migration` (12 commits sobre `main`).
Último commit: `e793737` (Fase 5 — hash redirects + robots + vercel.json).

---

## 0) Pre-flight — validación local (15 min)

Antes de pushear nada, recorré localmente las páginas críticas para detectar
cualquier regresión visual o de comportamiento.

```bash
# Dev server con HMR (lo arranqué en background, ver más abajo)
pnpm --filter showroom dev
# → abre http://localhost:3000

# Si querés probar la build SSG real:
pnpm --filter showroom generate
pnpm --filter showroom preview
# → abre http://localhost:3000 (sirve .vercel/output/static/)
```

**Checklist visual** — abrí cada una de estas y verificá:

- [ ] `/` — landing renderiza completo, dark mode toggle funciona
- [ ] `/forms/button` — preview de Button hidrata, código se copia, demos
      interactivos responden (variants, sizes, colors)
- [ ] `/feedback/modal` — el modal abre desde el demo, hace focus trap,
      bloquea scroll, cierra con Esc
- [ ] `/data-display/table` — tabla virtualizada scrollea, sort funciona
- [ ] `/calendar/scheduler` — drag-drop de eventos funciona
- [ ] `/forms/color-picker` — canvas drag + hex sync funciona
- [ ] `/theme-studio` — abre el FAB, cambia color/radius, persiste en localStorage
- [ ] `/docs/introduction` — links a otras páginas funcionan (botón "Installation"
      lleva a `/docs/installation`, no a `installation` literal)
- [ ] Sidebar — clic en cualquier item navega sin recargar, el item activo
      se subraya
- [ ] Header — language switcher cambia EN ↔ ES, color mode toggle funciona
- [ ] `⌘K` — command palette abre, busca componentes, navega a la página
- [ ] Mobile — abrí en DevTools mobile mode, verificá burger menu + drawer
- [ ] Hash legacy — `http://localhost:3000/#button` redirige a `/forms/button`

**Si algo no funciona**, anotá la página + el comportamiento y avisame
antes de seguir con el deploy. Es mucho más barato arreglar acá que
post-merge.

---

## 1) Limpieza de archivos legacy en la raíz (5 min)

El repo tiene artifacts viejos que sobraron del showroom y no deberían
quedar en main. No los borré yo en automático porque cualquier acción
destructiva sobre archivos que no creé requiere tu OK explícito:

```bash
# Verificá primero qué hay:
ls -la /Applications/Applications/modo-components/{plan.md,README.OLD.md,build_output.log,build_output_direct.log,build_result.log,output.txt,tsc_output.txt} 2>/dev/null

# Si todo es chatarra (yo creo que sí), borrá:
cd /Applications/Applications/modo-components
rm -f plan.md README.OLD.md build_output.log build_output_direct.log build_result.log output.txt tsc_output.txt

# Verificá:
git status --short
# Esperás ver las 7 líneas con "D " (deleted)

git add -A
git commit -m "chore: remove leftover artifacts from legacy showroom

build logs, README.OLD.md and plan.md were temporary scratch files
that survived the monorepo move. Not referenced by anything in the
new tree."
```

---

## 2) Push del branch + abrir PR (5 min)

```bash
# Asumiendo que el remoto se llama "origin":
git push -u origin feat/nuxt-migration
```

Después abrí el PR. Si tenés `gh` instalado:

```bash
gh pr create --base main --head feat/nuxt-migration \
  --title "Migrate showroom to Nuxt 4 + SSG with full SEO" \
  --body "$(cat <<'EOF'
## Summary

Migrates the public showroom from a hash-routed Vue SPA to a Nuxt 4 SSG
site so each component page becomes independently indexable by search
engines. Repo is converted to a pnpm workspaces monorepo:

- `packages/mood-ui/` — the library (no API changes, tarball verified
  identical to the current 0.7.1 release)
- `apps/showroom/` — new Nuxt 4 docs site (deployed to mood-ui.com)

12 commits, structured by phase — see `MIGRATION_NUXT.md` for the plan
and `docs/migration/` for the operational outputs (hash route map,
page inventory, SSR audit).

## Highlights

- **190 routes prerendered** in ~22s with `failOnError: true`
- **93 URLs in sitemap.xml** at `https://mood-ui.com/`
- **234 → 26 i18n JSON files** (consolidated by category)
- Per-page `<title>` / `<meta description>` / canonical, all server-rendered
- Landing ships `SoftwareApplication` JSON-LD + OG + Twitter cards
- Theme Studio wrapped in `<ClientOnly>` with SEO fallback
- Anti-FOUC plugin for dark mode
- Client-side redirect for legacy `mood-ui.com/#<id>` URLs
- CI publish workflow migrated from npm to pnpm

## Test plan

- [x] `pnpm --filter mood-ui build` (library compiles)
- [x] `pnpm --filter mood-ui test` (23/23 pass)
- [x] `pnpm --filter showroom generate` (SSG OK, 0 broken links)
- [x] `pnpm pack` (publishable tarball identical to current release)
- [ ] Visual smoke test on `pnpm --filter showroom dev` (component demos,
      dark mode, language switch, command palette, mobile drawer)
- [ ] Vercel preview deploy passes (auto from this PR)
- [ ] Lighthouse SEO >= 95 on preview URL

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Si no tenés `gh`, abrí la URL que `git push` te imprimió y creá el PR
manualmente con ese cuerpo.

---

## 3) Preview deploy en Vercel (automático)

Si el proyecto `mood-ui` ya está conectado a GitHub en Vercel, **el preview
deploy se dispara solo al pushear**. En el dashboard de Vercel vas a ver:

- Un deployment nuevo con el commit hash
- Una URL tipo `mood-ui-git-feat-nuxt-migration-<team>.vercel.app`
- El comentario del PR se actualiza con el preview URL

**Si NO está conectado todavía** (primera vez deployando este repo en
Vercel), configurá:

1. Entrá a `vercel.com/new`
2. "Import Git Repository" → seleccioná `alansinbailarin/mood-ui`
3. **Root Directory**: `apps/showroom` (importante — no la raíz del monorepo)
4. **Framework Preset**: Nuxt.js (Vercel autodetecta)
5. **Build Command**: `cd ../.. && pnpm --filter showroom generate`
   (necesita correr desde la raíz del monorepo para resolver `mood-ui` via
   workspace:*)
6. **Output Directory**: `.vercel/output/static`
7. **Install Command**: `cd ../.. && pnpm install --no-frozen-lockfile`
8. **Node version**: 22 (en Project Settings → General → Node.js Version).
   Node 25 funciona localmente pero Vercel no lo soporta oficialmente
   todavía; 22 es LTS y cumple los requisitos de Nuxt 4.

Después del primer deploy exitoso, configurá:

- **Domains** → agregá `mood-ui.com` y `www.mood-ui.com`. Vercel te dice
  qué registros DNS configurar.
- **Environment Variables** → ninguna por ahora; la app es 100% estática.

---

## 4) Validación del preview URL antes del merge (15 min)

Repetí el checklist visual del paso 0 pero contra el preview URL de
Vercel. Esto es crítico porque el preview corre con `NODE_ENV=production`
+ assets minificados — algunos bugs sólo aparecen acá.

Adicionalmente:

```bash
# SEO sanity check:
curl -s https://<preview-url>/forms/button | grep -oE "<title>[^<]+|<meta name=\"description\"[^>]+|<link rel=\"canonical\"[^>]+"
# Esperás:
#   <title>Button · mood-ui
#   <meta name="description" content="The primary action…
#   <link rel="canonical" href="https://mood-ui.com/forms/button"

# Sitemap accesible:
curl -s https://<preview-url>/sitemap.xml | grep -c "<loc>"
# Esperás: 93

# robots.txt:
curl https://<preview-url>/robots.txt
# Esperás:
#   User-agent: *
#   Allow: /
#   Sitemap: https://mood-ui.com/sitemap.xml

# Lighthouse SEO (requiere Chrome o npx):
npx lighthouse https://<preview-url> --only-categories=seo --output=json --output-path=/tmp/lh.json --quiet
node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/lh.json')).categories.seo.score)"
# Esperás: 1 (100%)
```

---

## 5) Merge a main + deploy a producción (5 min)

Una vez que el preview pasó el checklist:

```bash
# Si tenés gh:
gh pr merge feat/nuxt-migration --squash --delete-branch
# o --merge / --rebase según tu workflow

# Si lo hacés desde la UI de GitHub, lo mismo: Squash & merge,
# Delete branch on merge.
```

Vercel detecta el merge a `main` y **promueve automáticamente** el preview
a producción (alias `mood-ui.com`). Verificalo:

```bash
curl -sI https://mood-ui.com | head -5
# Esperás 200, no 308/302 (eso indicaría redirect a www.)

curl -s https://mood-ui.com/forms/button | grep -oE "<title>[^<]+"
# Esperás: <title>Button · mood-ui
```

---

## 6) Google Search Console (15 min activos + monitoreo de 1-2 semanas)

1. **Acceso**: entrá a [search.google.com/search-console](https://search.google.com/search-console)
   con la cuenta de Google asociada a `agpsalgado@gmail.com` (o la que
   uses para webmaster tools).

2. **Verificar dominio** (si no está verificado todavía):
   - "Agregar propiedad" → tipo "Dominio" → `mood-ui.com`
   - Te da un TXT record para agregar al DNS. En Vercel: Project → Domains
     → mood-ui.com → DNS. Agregá el TXT y esperá ~5 min a que propague.
   - Volvé a Search Console y dale "Verificar".

3. **Subir sitemap**:
   - Sidebar → "Sitemaps"
   - Pegá `sitemap.xml` (sin el `https://mood-ui.com/` — Google le antepone
     el dominio verificado)
   - Status esperado: "Éxito · 93 URLs descubiertas"

4. **Solicitar indexación de las top 10 páginas manualmente**:
   - Barra superior → pegá `https://mood-ui.com/`
   - "Solicitar indexación" (toma 1-2 min)
   - Repetí para:
     - `https://mood-ui.com/docs/introduction`
     - `https://mood-ui.com/docs/installation`
     - `https://mood-ui.com/forms/button`
     - `https://mood-ui.com/forms/input`
     - `https://mood-ui.com/forms/select`
     - `https://mood-ui.com/feedback/modal`
     - `https://mood-ui.com/data-display/table`
     - `https://mood-ui.com/data-display/calendar`
     - `https://mood-ui.com/theme-studio`

5. **Monitoreo (semanas 1-4)**:
   - **Cobertura** → "Páginas indexadas". Objetivo: 80+ de 93 en 2 semanas.
   - **Rendimiento** → "Total de impresiones". Esperable: arranca en 0,
     sube progresivamente conforme Google rastrea más páginas.
   - **Errores de crawl** → si aparece "Sitemap no se pudo leer", revisar
     que `https://mood-ui.com/sitemap.xml` sea accesible (probá
     `curl -I` desde otra red).
   - **Cobertura > Excluidas** → si Google reporta muchas como "Detectada,
     no indexada", suele ser ranking bajo (no error). Si dice "Página con
     redirección" en páginas que NO deberían redirigir, revisar el
     middleware de hash en `app.vue`.

---

## 7) Cosas para hacer después del deploy (opcional, no bloquea)

- **og-image.png** — el plan referencia `https://mood-ui.com/og-image.png`
  para Twitter/OG share cards, pero el archivo NO existe en
  `apps/showroom/public/`. Generar uno (1200×630 px con el logo y el tagline)
  y subirlo. Sin esto, las share cards en Twitter/Slack/LinkedIn usan el
  primer recurso visual de la página, que puede ser inconsistente.

- **GitHub Actions: build check on PR** — el workflow actual sólo publica
  a npm. Agregar un workflow que corra `pnpm --filter showroom generate`
  en PRs para que un broken link rompa el CI antes del merge. Ejemplo:

  ```yaml
  # .github/workflows/preview.yml
  name: Build docs site
  on:
    pull_request:
      paths: ['apps/showroom/**', 'packages/mood-ui/**']
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 10.33.0 }
        - uses: actions/setup-node@v4
          with: { node-version-file: '.nvmrc', cache: 'pnpm' }
        - run: pnpm install --frozen-lockfile
        - run: pnpm --filter mood-ui build
        - run: pnpm --filter mood-ui test
        - run: pnpm --filter showroom generate
  ```

- **4 templates huérfanas** — `pages/templates/{Auth,Dashboard,Pricing,Settings}Page.vue`
  del legacy no se migraron (no estaban en el sidebar registry, sin
  tráfico actual). Si querés agregarlas a `/templates/auth` etc., copialas
  manualmente y agrégalas al `nav-manifest.ts`.

- **Lighthouse Performance** — el bundle del docs site pesa ~750 KB
  pre-gzip (lib + Nuxt runtime). Está OK pero hay margen: lazy-load
  shiki sólo cuando el usuario abre la tab "Code" en `CodePreview.vue`
  reduciría ~300 KB del initial load.

- **Limpieza de la rama** — después del merge, eliminar localmente:
  ```bash
  git checkout main
  git pull
  git branch -D feat/nuxt-migration feat-showroom-components-update
  ```

---

## Resumen — checklist de un vistazo

- [ ] Paso 0: validación visual local (`pnpm --filter showroom dev`)
- [ ] Paso 1: limpieza de archivos legacy en raíz
- [ ] Paso 2: `git push -u origin feat/nuxt-migration` + abrir PR
- [ ] Paso 3: confirmar que el preview deploy de Vercel se generó
- [ ] Paso 4: checklist visual + SEO sanity check contra el preview URL
- [ ] Paso 5: merge a main → Vercel promueve a producción
- [ ] Paso 6: Search Console — verificar dominio, subir sitemap, solicitar
      indexación de las top 10 páginas
- [ ] Paso 6.5: monitoreo semanal (1-4 semanas)
- [ ] Paso 7: opcionales (og-image, CI workflow, lighthouse perf)

Si te trabás en algún paso, traeme el error y lo desbloqueamos juntos.
