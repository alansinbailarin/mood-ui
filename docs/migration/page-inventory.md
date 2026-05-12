# Inventario de páginas del showroom

Generado 2026-05-12 desde `src/showroom/pages/` y `src/showroom/registry.ts`.

## Resumen

| Total filesystem | En registry (con hash) | Sin hash legacy |
|------------------|------------------------|-----------------|
| 97               | 93                     | 4               |

## Páginas SIN hash legacy (no acceden por URL hoy)

Estas 4 viven en `src/showroom/pages/templates/` pero no están registradas en `showroomNav` ni se enlazan desde `TemplatesIndexPage.vue` (la index es solo un listado "coming soon"). Es decir: **no hay tráfico hacia ellas en el showroom actual**.

| Archivo | Estado actual | Acción en migración |
|---------|---------------|---------------------|
| `templates/AuthTemplatePage.vue`      | huérfana en repo | Migrar a `/templates/auth` (lazy — segunda pasada) |
| `templates/DashboardTemplatePage.vue` | huérfana en repo | Migrar a `/templates/dashboard` (lazy — segunda pasada) |
| `templates/PricingTemplatePage.vue`   | huérfana en repo | Migrar a `/templates/pricing` (lazy — segunda pasada) |
| `templates/SettingsTemplatePage.vue`  | huérfana en repo | Migrar a `/templates/settings` (lazy — segunda pasada) |

Recomendación: **no incluir en la primera pasada de migración**. Si quedan tiempo al final de Fase 4, agregarlas — no hay hash redirect que las cubra porque nadie las indexó.

## Páginas con hash legacy

Ver `hash-route-map.json` para el mapping completo. 93 entries.

## Categorías de navegación (orden del sidebar)

1. `getting-started` → 1 page (welcome)
2. `docs` → 6 pages
3. `templates` → 1 page (TemplatesIndexPage; las 4 sub-templates no están en sidebar)
4. `theme-studio` → 1 page
5. `forms` → 30 pages
6. `feedback` → 13 pages
7. `data-display` → 10 pages
8. `calendar` → 6 pages (filesystem: data-display/)
9. `date-picker` → 2 pages (filesystem: data-display/)
10. `layout` → 11 pages
11. `navigation` → 5 pages
12. `composables` → 7 pages
13. `utilities` → 1 page

**Total navegable**: 94 (incluyendo el TemplatesIndexPage que sí está en sidebar).
