# PublicPage

The public page of each workspace, at the root of its address (`<slug>.<root domain>/`): a fixed header with the business's
logo, name and tagline, then blocks in the order its owner chose. Backend package `backend/packages/PublicPage`, frontend layer
`frontend/layers/public-page`. Remove both and the root of a workspace shows core's way in (the header alone).

## What a visitor gets

| State | What the root shows |
|---|---|
| Published and visible | Header, blocks and footer |
| Nothing published yet | The way in: logo, name, tagline, "Client portal" (while the portal is open) and "Sign in" |
| Turned off by its owner, turned off for the workspace by the platform, or with no block left to show (all hidden or not allowed) | The way in, with `noindex` |

## The document

A page keeps a draft and what it published, each a document:

    {
      "tagline": { "en": "...", "es": "..." },
      "seo": { "title": { "en": "..." }, "description": { "es": "..." } },
      "blocks": [ { "id": "<uuid>", "type": "faq", "hidden": false, "data": { ... } } ]
    }

Every text the owner writes is by language, with the platform's languages (`support.locales`) as keys; one missing is shown in
the workspace's main language. At most 30 blocks (`public_page.max_blocks`) and 256 KB (`public_page.max_document_bytes`).
Only `Pages\PageRows` writes `public_pages`, and only what `Document\ValidateDocument` let through: its size, its shape, each
block's rules, clean text everywhere and images of the workspace only.

## The draft

The editor works on the draft and visitors see what was published. A draft may be unfinished but is never unsafe: it is
checked as a draft (`Enums\DocumentMode::Draft`), where `Document\DraftRules` takes away only the rules that ask for something
to be there (`required`, `present`, `filled`, `accepted`, the fewest items of a list, a text written in one language at least)
and keeps every rule that checks a value that is there: types, lengths, choices, ids, links, Markdown, the size, the shape and
the images of the workspace. A new block can be saved before its text is written, and a link that is not safe never can.
`Document\BlockProblems` says what each block still lacks, and the API sends it as `incomplete`.

Publishing checks every block that is not hidden, whole. A hidden block may be published unfinished; if it is shown later, the
next publish checks it whole.

`Pages\PageRows` is the only writer, and every write of the document (saving, publishing, discarding) holds the row, checks
the `version` the editor sent and bumps it. A stale version answers 409 `public_page.draft_conflict` with the current one in
`meta.version`, and nothing is written. Turning the page off or on (`PATCH /public-page`) takes no version and does not change it.

## Blocks

| Type | Keeps | Draws |
|---|---|---|
| `text` | `title`, `body` (formatted, up to 5,000 characters) | One column |
| `image_text` | `image`, `imageAlt`, `title`, `body`, `imageSide` (`start`/`end`), `buttonLabel` and `buttonUrl` (both or none) | Two columns, one on a phone |
| `gallery` | `title`, `images`: 2 to 12 `{ media, alt }` | A grid; each opens large |
| `branches` | `title`, `mode` (`all`/`selected`), `branchIds`, `showMap` | A map and a card per branch: address, today's hours with "Open now", phone, directions. A page takes at most one |
| `contact` | `title`, `phone`, `email`, `whatsapp` (E.164), `socials` (up to 10, https), `links` (up to 10) | A row of contact and full-width buttons |
| `faq` | `title`, `items`: 1 to 30 `{ question, answer }` | mood-ui's Accordion |

`title` is optional on `text`, `image_text`, `gallery`, `branches`, `contact` and `faq`, by language (up to 120 characters, `TextBlock::TITLE_MAX`);
the page draws it as the section's `h2`, and none when it is empty.

A block is a class that implements `MoodKit\PublicPage\Contracts\PublicPageBlock`, tagged `public-page.blocks`:

- `type()`: snake case, unique; it names the frontend's component too (`PublicBlock<Type>.vue`).
- `nameKey()`, `descriptionKey()`: translation keys of its name and of a line about it.
- `fields()`: a list of `Contracts\Field` (text, richText, media, mediaList, url, enum, bool, branchPicker, repeater, phone,
  email), what the editor builds the block's form from.
- `rules($locales)`: start from `Contracts\BlockRules::of($this->fields(), $locales)` and add your own.
- `resolve($data, $context)`: what the component draws. Read other packages through their contracts (the branches block reads
  `Branches\Contracts\ListsPublicBranches`) and images through `$context->media`.
- `sample()`: data of example that passes `rules()`. The admin's catalog and the editor's "Add a block" draw it as the block's
  thumbnail (see [Samples](#samples)).

`Registry\BlockRegistry` lists the kit's six first, in the order of the table above (`Blocks\KitBlocks::CLASSES`), then any other
block by type; both catalogs show that order. It refuses a malformed block when it first gathers them. A test of the package checks that every installed
block has its texts in English and in Spanish and a sample that passes its own rules.

### Blocks of your own

A block of your own lives in a package of yours and starts with `php artisan kit:make-block <Name> --package=<Package>`. The command
writes the class, its words in English and Spanish (and a copy in English for each other language of `support.locales`), its Pest test, the tag in the package's provider, and the component and its
Vitest test in the public-page layer. The block starts off in the admin's catalog until an admin turns it on. `BlockContractTest`
checks every installed block, the kit's and each package's, and says in a sentence what each one lacks (its component, its words
in each language, a sample that passes its own rules, a `resolve()` that draws that sample with no workspace and no query). It
also crosses the registered types with the components of the layer in both ways. The kit's own tests list only the kit's blocks,
so a package of yours never changes what they expect. The steps, a complete example and a prompt for an agent are in
[Add a block to the public page](../guides/add-a-public-page-block.md).

### Samples

`GET /public-page/blocks` and `GET /platform/public-page` carry each block's `sample`: its `sample()` resolved by `resolve()` with
`BlockContext::forSample()`. That context has no workspace (an empty `tenantId`), has `sample` set to `true`, and resolves an image
on the spot as a drawn gradient in a `data:` address (`Catalog\SampleMedia`), so a thumbnail needs no file and no storage.

A block that reads live data in `resolve()` must check `$context->sample` and answer fictional data, and never query with the empty
workspace. The branches block does it: for a sample it answers two example branches and `showMap: false`, so a thumbnail carries no
map. `BlockContractTest` fails when a sample's `resolve()` makes a query. A block's `sample()` must also carry English, the
language a thumbnail falls back to.

A block whose `resolve()` throws for its sample is reported (`report()`) and carries an empty `sample` (`[]`) instead of taking the
catalog down; its thumbnail draws an empty box, and the admin can still turn the block off.

### Safety

- Formatted text is limited Markdown (paragraphs, bold, italics, lists, links) rendered by an allowlist; no HTML ever reaches the
  page.
- Links are `https:`, `mailto:` or `tel:` only (`Contracts\Rules\SafeLink`, and inside formatted text `SafeMarkdown`); external
  ones carry `rel="noopener nofollow"`.
- WhatsApp is kept in E.164 and drawn as `https://wa.me/<number>`.
- An image is the id of one of the workspace's own (`public_page_media`); the server builds its address.
- Both tables are under row-level security.

## Images

`public_page_media` keeps each image's key on the assets disk (`tenants/<id>/public-page/<uuid>.<ext>`), type, size and
dimensions. Only `Media\MediaFiles` writes it, the file first.

There are two ways to upload an image, and the editor picks one by `meta.mediaUpload` of the draft:

- **Through the API** (the default): `POST /public-page/media`, a multipart `file`.
- **Straight to the bucket**: with `PUBLIC_PAGE_MEDIA_PRESIGN=true` and an S3 assets disk (with CORS on the bucket, see
  [Storage](../configuration/storage.md#uploads-straight-to-the-bucket-presign)), `POST /public-page/media/presign` gives a
  short-lived address in the uploads area of the workspace, the browser PUTs the bytes there with exactly the headers it was
  given, and `POST /public-page/media/confirm` takes the upload.

What is checked is the same in both. Only a JPEG, a PNG or a WebP is taken, decided by its bytes and never by its name or its
declared type, up to `public_page.media.max_bytes` (5 MB). What is kept is a new file GD writes from the decoded picture, shrunk
to `public_page.media.max_side` (2400 px) on its longest side, so nothing that rode along survives. A confirmation takes only a
key that is an upload of this workspace (`AssetPath::isUploadOf`), asks the bucket for its size before reading a byte, and checks
that the type it was stored with is what its bytes are. The upload is deleted whatever the answer, so a second confirmation finds
nothing. An image of another workspace is never usable: a draft that names one is refused.

Uploads, presigns and confirmations share one limiter per member, `public-page-media` (`public_page.media.uploads_per_minute`, 20).

### The daily cleanup

`php artisan public-page:prune-media` runs every day at 04:10 UTC, on one server and never overlapping. In every workspace
(deleted ones too), as the workspace, it deletes the images that no page names and that are older than
`public_page.media.orphan_hours` (24): the file first, then its row. An image counts as used when its id appears anywhere in the
draft or in what was published, not only in the fields of the blocks declared today, so a block whose package was removed keeps
its images. A workspace that fails is reported and the rest go on. One case is left open on purpose: an image older than a day
that nobody used and that someone puts back in the very moment of the cleanup.

## The API

| Method and path | Who | What |
|---|---|---|
| `GET /public-page` | Anyone on the workspace's address (`tenant`, limiter `public-page` by workspace, `public_page.reads_per_minute`) | `state`, `defaultLocale`, `locales`, `tagline`, `seo`, `ogImage`, `showCredit` and the `blocks` resolved. `Cache-Control: public, max-age=60`, `Vary: X-Tenant-Slug, Accept-Language`. |
| `GET /public-page/draft` | `public_page.view` | The draft as the editor reads it. It never creates the row: a workspace with no page gets version 0 and the empty document. |
| `PUT /public-page/draft` | `public_page.manage`, limiter `public-page-write` | Saves `{ version, document }` and answers the draft with the version plus one. |
| `POST /public-page/publish` | `public_page.manage`, `public-page-write` | Publishes the draft of `{ version }`. Audited. |
| `POST /public-page/discard` | `public_page.manage`, `public-page-write` | Puts back what was published, or the empty page, for `{ version }`. Audited. |
| `PATCH /public-page` | `public_page.manage`, `public-page-write` | Shows or hides the page: `{ visible }`. Audited only when it changes. |
| `GET /public-page/blocks` | `public_page.view` | Each block, whether this workspace may add it (`allowed`) and, when not, why (`unavailable`: `"off"` when the platform turned the block off for everyone, `"plan"` when it is on and the workspace's plan lacks its feature, `null` while allowed), its fields as the editor builds forms, and the `sample` its thumbnail draws, named in the member's language. `meta.pageAllowed` says whether the page may show at all, `meta.pageUnavailable` why not (`"off"` when the platform turned this workspace's page off, which wins, `"plan"` when the plan lacks the page's feature, `null` while allowed) and `meta.offReason` what the admin wrote, only with `"off"`. |
| `GET /platform/public-page` | A super admin (`platform` group, the admin's host) | The admin's catalog (see [The admin's catalog](#the-admins-catalog)). |
| `PATCH /platform/public-page` | A super admin, `throttle:platform` | Saves what changed of the catalog and answers it whole. |
| `GET /platform/workspaces/{workspace}/public-page` | A super admin (`platform` group, the admin's host) | The platform's switch for that workspace's page: `{ off, reason, offAt }`. A read across workspaces with the purpose `public_page.workspace_hold`. 404 `public_page.workspace_not_found` for an id that is no workspace. |
| `PATCH /platform/workspaces/{workspace}/public-page` | A super admin, `throttle:platform` | Turns that page off or on: `{ off, reason? }` (the reason is up to 500 characters and is kept only with `off: true`). Answers what it wrote. |
| `POST /public-page/media` | `public_page.manage`, `public-page-media` | Uploads an image through the API. Answers 201 `{ id, url, width, height }`. |
| `POST /public-page/media/presign` | `public_page.manage`, `public-page-media` | An upload address for `{ mime, sizeBytes }`. 404 while presign is off. |
| `POST /public-page/media/confirm` | `public_page.manage`, `public-page-media` | Takes the upload at `{ objectKey }`. 201 `{ id, url, width, height }`. |

A text by language with nothing in it comes as `[]`: read it as an empty map. A message about a block's field names it by its label in the
language of the request ("The text field is required"), and a form shows it only once that field was edited or a publication was tried.

The editor's answers share one shape (`GET /public-page/draft`): the draft as kept, what each block resolves to by its id (hidden
ones too), what each block lacks to be published, the images it names and the active branches for the picker. Saving, publishing
and discarding send the `version` the editor loaded; a stale one answers 409 `public_page.draft_conflict` with the current
version in `meta`, and nothing is written. The frontend's fixtures and the e2e stub are built from this shape, and
`EditorContractTest` fails when it changes.

The editor's routes are write routes of the `workspace` group that an impersonation may use, like the settings and the logo:
saving, publishing, discarding, turning the page off and the three image uploads. The trail names the admin.

## Permissions

`public_page.view` shows the editor and `public_page.manage` (which requires the first) changes the page. The kit declares them in
code (`PublicPageRbacProvider`), with a menu entry "Public page" in the Administration section. The system roles Owner and
Manager have every permission by template and get them when a workspace is created; the `member` role gets none. A workspace
that already exists gets them with `php artisan rbac:sync`, which every deploy that adds permissions runs.

## Audit

Three actions, on the resource `PublicPage` with the workspace's id, always with small data and never the document:
`public_page.page.published` (the version, the number of blocks and the dates of the publish and of the one before),
`public_page.draft.discarded` (the version and the number of blocks) and `public_page.page.visibility_changed` (`visible`).
Saving the draft is not audited: it happens every second while someone types.

When the platform turns a workspace's page off or on, `public_page.page.platform_off` (`before` is `{ off: false }`, or the old reason when only the reason changed; `after` is `{ off: true, reason }`) and `public_page.page.platform_on` (`before` is `{ off: true, reason }`, `after` is `{ off: false }`) are written to both trails: the workspace's own, which its people read, and the platform's, with the workspace's id, which the workspace's Activity tab lists. Asking for what already is writes nothing to any table or trail.

What an admin changes in the catalog is audited on the platform's trail (`platform_audit_logs`), about no workspace:
`public_page.catalog.block_updated` (resource `PublicPageBlock`, the block's type as its id, `{ enabled, requiredFeature }`
before and after) and `public_page.catalog.options_updated` (resource `PublicPageOptions`, id `public_page`,
`{ requiredFeature, showCredit }` before and after). There is one entry for each change, and what is sent as it was writes none.

## What the platform allows

`Catalog\Availability` says whether a workspace may show its page, each type of block and the "Made with" credit. It is bound to
`Catalog\PlatformCatalog`:

- A block is allowed while the admin's catalog has it on and the workspace's plan includes the feature the block asks for, if it
  asks for one. With no row in the catalog a block is on if it is one of the kit's (`Blocks\KitBlocks`, told by class) and off if it
  comes from any other package.
- The page is allowed while the platform has not turned this workspace's off (see [The platform's switch for a workspace](#the-platforms-switch-for-a-workspace)) and the plan includes the page's feature, if the catalog asks for one. The switch is asked first and wins over the plan.
- The credit shows as the admin chose, and shows until then.

A block that is not allowed is not drawn and stays in the document. The editor marks it, and saving refuses a new one with 422
`public_page.block_not_available` (`field` `blocks.<i>.type`, `meta.type`). "New" means its id was not in the saved draft with that
same type: a block that was already there is kept, and a reused id with another type counts as new. Publishing and discarding do
not check, since they add no block. A page that the plan does not include does not switch the editor off: the owner can still edit
and publish, and the editor shows a notice that the page is off.

The catalog is cached for an hour under a generation that moves on after each save commits, and is read once per request. A
workspace's plan is cached by Plans and forgotten on each change of subscription. The resolved blocks of a page are cached by
`ShowPublicPage` under a key that carries the ids of the blocks it shows. So a change to the catalog or to a plan shows at the
next read and never waits for the minute. If the cache cannot be told after a save, the save stands, the failure is logged and the
old catalog can show for up to the hour. The only wait left is an HTTP cache in front of the API, which can hold
`GET /public-page` for the 60 seconds of its `Cache-Control`.

## The platform's switch for a workspace

The platform can turn one workspace's public page off, for instance when it shows what it should not. The switch is the table
`public_page_holds`: one row per workspace, with an optional reason the owner reads and who set it. A row means the page is off, no
row means the workspace's own choice and its plan decide. It has row-level security like any table with a `tenant_id`, and the
platform's read-only role can read it.

While it is off, a visitor gets the way in with `noindex`, as when the owner turns the page off, and the editor shows a notice with
the reason. The owner can still edit, save and publish, and the last published page shows again when the platform turns it on.

Only `Holds\HoldRows` writes the table. It works as the workspace (`RunAsTenant`) in one transaction under a lock named by the
workspace's canonical id, writes both trails, and tells `Holds\PageHolds` to forget. `PageHolds` is what the pages and the editor
ask: one read by primary key per request, as that workspace, with no cache of its own. The admin reads it through
`Holds\WorkspaceHolds`, a read across workspaces. Its two routes are in `platform`'s group, and the write has `throttle:platform`. A
new reason with the page already off is kept and the date stays.

## The admin's catalog

The admin chooses what every workspace may use, on the screen `/platform/public-page` of the admin's host (a menu entry in the
Administration section, with no permission: every super admin sees it). Two tables keep it, and each stores only what an admin
changed:

- `public_page_blocks`: a row for each block an admin changed (`type`, `enabled`, `required_feature`, `version`, who changed it).
  A block with no row follows its default: on for the kit's six, off for the block of any other package. A block a later release of
  the kit adds shows up on with no migration, and a module's block shows up off until an admin turns it on.
- `public_page_options`: one row for the page itself (`required_feature`, `show_credit`, `version`). With no row the page asks for
  no feature and shows the credit.

`Catalog\CatalogRows` is the only writer of both tables.

`GET /platform/public-page` answers `{ blocks, options, features }`. Each block has `type`, `name`, `description`, `enabled`,
`requiredFeature`, `version` and `sample`, in the language of the request; `options` is `{ requiredFeature, showCredit, version }`;
`features` is the features of the plans to choose from, `{ slug, label }`. It reads the tables, never the cache.

`PATCH /platform/public-page` takes only what changed: `blocks` (each type once, with `enabled`, `requiredFeature`, and the
`version` that was read) and `options` (with its own `version`), at least one of the two. Every `requiredFeature` is sent, and
`null` means none. It is all or none, under one lock, and it answers the whole catalog like `GET`. It is limited by `throttle:platform`.

| Answer | When |
|---|---|
| 409 `public_page.catalog_changed` | A version sent is not the current one. `meta.currentVersions` is `{ blocks: { <type>: version }, options: version }` for what was sent, and nothing is written. |
| 422 `public_page.block_unknown` | A `type` that no package declares (`field` `blocks.<i>.type`). |
| 422 `public_page.feature_unknown` | A feature that no package declares (`field` `blocks.<i>.requiredFeature` or `options.requiredFeature`). |
| 422 `validation.*` | The body has the wrong shape, or a type is repeated. |

PublicPage registers the plan feature `public_page` ("Public page"). To sell the page, or one block, in some plans only, turn the
feature on in those plans in `/platform/plans` and ask for it here. No plan of the kit includes it, so nothing changes until the
catalog asks for it. A feature that no package declares any more makes its block (or the whole page) unavailable to everyone; the
screen shows it as gone, and saving that block needs another feature or none.

### Upgrading

A block that a module wrote by hand before the admin's catalog existed is off after the upgrade, since it is not one of the kit's.
Turn it on in `/platform/public-page`. The kit's six stay on.

## Configuration

`backend/packages/PublicPage/config/public_page.php`: `reads_per_minute` (3000), `max_blocks` (30), `max_document_bytes` (262144),
`writes_per_minute` (120, limiter `public-page-write`, per member) and `media`: `max_bytes` (5242880), `max_side` (2400),
`uploads_per_minute` (20, limiter `public-page-media`, per member), `presign_ttl_minutes` (5) and `orphan_hours` (24).
`media_presign` is the only one read from the environment, as `PUBLIC_PAGE_MEDIA_PRESIGN` (default `false`).

The read limit counts per workspace, not per visitor: the frontend's server reads for every visitor from one address, so an
address key would make them all share one count. Limit each visitor at the edge (Caddy, Cloudflare or your proxy).

## The demo

`db:seed` publishes a page of every block for the workspace `demo` (the sections titled in English and Spanish, the branches block
with its map), with four pictures drawn with GD and stored on the assets
disk (run `php artisan assets:prepare-bucket` first, as for the logo). The demo's three branches (`Branches`' `DemoBranchesSeeder`)
have an address, a point near Tijuana and Monday to Saturday hours, so the map and "Open now" have something to show.

## Frontend

The `public-page` layer draws the root of a workspace's host. `frontend/app/pages/index.vue` asks core's `kit:workspace:home`
hook what to draw there; the layer's plugin answers with `PublicPageHome`, which draws the published page (core's
`WorkspaceHomeHeader`, the blocks, core's `WorkspaceHomeFooter`) or core's `WorkspaceGateway`. Without the layer, the root is
`WorkspaceGateway`.

- The page is loaded by the layer's middleware before it is drawn, on the server too, so its content is in the HTML search
  engines read. A visitor who chose no language the app speaks and whose browser names none gets the business's main language.
- The header (core's `WorkspaceHomeHeader`) is one compact row on a phone, below `sm`: the logo and the name (no tagline) and a menu
  button that opens a flat panel (hairline, no shadow) with the language, "Client portal" and "Sign in"; Escape or a press outside
  closes it. From `sm` it shows them in the row.
- A block's component is `app/components/blocks/PublicBlock<Type>.vue` (`image_text` is `PublicBlockImageText.vue`): it gets
  `data` (what the backend's `resolve()` answered) and `locale` (`{ current, fallback }`). `PublicPageBlocks` finds it by the
  file's name and draws it in a section of the page's width (`max-w-6xl`, the same padding for every block; `text`, `faq` and `contact` keep one reading
  width inside it, `max-w-3xl`); a block's own title is drawn by `PublicPageHeading`; a type with no component is skipped (the console says so while
  developing).
- Texts by language go through `textIn()`; formatted text through `PublicPageMarkdown` (an allowlist parser, never `v-html`);
  links through `safeHref()` (https, mailto, tel) and, when external, `EXTERNAL_LINK` (`target="_blank" rel="noopener nofollow"`).
- "Open now" is worked out in the browser after the page mounts, on each branch's own clock (`branchToday()`).
- SEO (`usePublicPageSeo`): title, description, canonical (the workspace's root on the root domain), `og:image` (the first
  image, or the logo), JSON-LD (`LocalBusiness` per branch, or `Organization`), and `noindex` unless a page is published (a
  page turned off, or a workspace that published nothing).
- `robots.txt` of a workspace lets crawlers read its root alone (`Allow: /$`, `Allow: /_nuxt/` for its scripts and styles, `Disallow: /`).

### The editor

The editor is the screen `/dashboard/public-page` (the layer's `pages/dashboard/public-page.vue`). It needs `public_page.view`; whoever also has
`public_page.manage` can change things, and whoever only has `view` sees everything read-only, with no way to add, move, hide or delete.
On a wide screen (from 1024 px) it has two columns: the page's settings and the list of blocks on the left (the form of one block takes
the place of both while it is open), and the preview on the right. On a narrower one the same two sides are the tabs "Edit" and
"Preview", and the form that was open stays open when the window crosses the breakpoint. The header says the page's state and has
"View page", "Discard changes" and "Publish". There is no save bar.

**The form of a block comes from its fields.** The editor asks `GET /public-page/blocks` for each block's fields and draws the form from
them. Every field type of the backend (`text`, `richText`, `media`, `mediaList`, `url`, `enum`, `bool`, `branchPicker`, `repeater`,
`phone`, `email`) has its input in `utils/field-form.ts`, so a block that a module registers needs no form of its own: its fields are
enough. A text field is drawn once per language, behind a tab for each, and a tab says how many of its texts are still empty while another
language has them. A repeater item gets its own number, so the buttons that remove them can be told apart by a screen reader.

**The draft saves itself.** `useDraftAutosave` waits one second after the last change, sends one save at a time (a change typed while one
travels goes in the next one) and sends the version the editor holds. Two answers stop it. A 409 means someone else saved first: nothing of
theirs was overwritten, a dialog that cannot be closed offers to load their version, and what was typed since is not saved. A 422 means the
document was refused: the message shows above the form, the block it is about gets an "Has an error" badge in the list and its form shows the
message under the field (by the block's position in the document that was sent), and the draft waits for the next change. Any other failure is a toast and the
change waits for the next try. Leaving the page, in the app or by closing the tab, saves what is pending first and warns only about what
could not be saved.

**The preview is a page of the app, in a frame.** The frame holds `/public-page/preview`, drawn by the browser (it needs the session) and
out of search engines. It is the only page of the app that may be framed, and only by its own origin: its route rule sends
`X-Frame-Options: SAMEORIGIN`, and core's Content Security Policy then says `frame-ancestors 'self'` for it, so the header and the policy
agree. Every other page keeps `DENY` and `frame-ancestors 'none'`, and the pages of a workspace carry `frame-src 'self'` so the editor can
hold it (the admin's host does not, and core's security headers plugin forces `X-Frame-Options: DENY` there whatever a route rule says). The editor posts the page to the frame, as plain data, on every change (with the id of the block whose form is open) and when the frame says it is
ready; the frame draws it the way a visitor would see it, minus the client portal, and its links go nowhere. When the open block changes, the frame scrolls that block into view (smoothly, or at once under reduced motion), never on an update of the same block. Its header's language select, ways
in and menu are inert (`preview` on core's `WorkspaceHomeHeader` and `WorkspaceGateway`), so using them cannot save a language on the signed-in
person; the blocks stay interactive. Both sides take a message only
if it names this conversation, comes from this origin and comes from the one window expected (the frame, or its parent): another page
that managed to open the editor or the preview cannot feed it a page. A message is read without trusting its shape and drawn with Vue's
interpolation only. Opened on its own, the preview loads the draft itself.

Some fields show in the preview as they are typed (texts, rich texts, choices and switches); the rest (images, links, phones, the
branches a block lists) show when the save comes back, because the backend resolves them (`resolve()`). A block added since the last save
appears once that save returns.

**Publishing.** The panel is read-only while a publication or a discard travels. Whatever was typed before the answer comes back stays on the new
version and is saved by the next autosave. "Publish" first saves what is pending. A block that is shown and not finished stops it: a dialog lists the blocks (by
name and position) and offers only "Back". A text written in one language and missing in another does not stop it: the dialog lists each
place ("Missing in English: Frequent questions, block 2, Question 2") and offers "Back" and "Publish anyway". A conflict found while
publishing goes to the same dialog as the autosave's. "Discard changes" asks first, says what it does (the draft goes back to what is
published, or is left empty if nothing was ever published) and saves what is pending before it asks.

**What mood-ui lacks here.** The list of blocks reorders with a handle of its own, by pointer and by the arrow keys; see
[Known gaps in mood-ui](../frontend.md#known-gaps-in-mood-ui).

**Tests.** The unit tests are in `frontend/layers/public-page/tests` and use the fixtures in `tests/fixtures/editor.ts`. The end-to-end
spec is `frontend/tests/e2e/public-page-editor.spec.ts`; its stub (`tests/e2e/support/stub-public-page-editor.ts`) answers from the same
fixtures and keeps nothing between requests, and the workspace `clash` is the one whose saves always meet a newer version. The preview's
framing headers are checked in `tests/e2e/security.spec.ts`.

**The plan shows in the list and in the dialog.** `GET /public-page/blocks` says for each block whether the workspace may use it
(`allowed`) and why not (`unavailable`). A block that is not allowed stays in the draft and its duplicate button is disabled. Its row says
"Not in your plan" for `plan` and "Not available" for `off`; in "Add a block" its card is disabled and says "Available in another plan"
for `plan` and "Not available right now" for `off`; its form's banner links to the subscription only for `plan`. When the page itself is not in the plan
(`meta.pageAllowed` is false) a warning above the editor says so. It has two cases, told by `meta.pageUnavailable`: with `plan` it links to the subscription; with `off`, the platform turned the page off for this workspace, it says that, shows the reason the admin wrote when there is one, and has no link, since a subscription would not fix it. In both the owner keeps editing, saving and publishing. Every card of "Add a block" carries the
block's thumbnail (see below). If a save is refused with `public_page.block_not_available` (the admin turned the block off, or the plan
changed, while the editor was open), the editor reads the catalog again so the lists match the platform.

### Thumbnails

`PublicPageBlockThumbnail` draws a block the way a visitor would see it, small. It takes the block's `type` and the `sample` the API
resolved for it (`GET /public-page/blocks` and `GET /platform/public-page` both send one) and draws the block's own component through
`PublicPageBlocks`, so a block a module adds gets its thumbnail with no code of its own. The component is drawn at 1024 px wide inside a
box with a 16 to 10 ratio and shrunk with a CSS `transform` (`usePreviewScale` reads the width the box really has), so the block keeps the
layout of a desktop page whatever the card's width. The thumbnail is `inert` and `aria-hidden`: nothing in it can be focused or clicked,
and a screen reader reads the card's name and description instead. It is not an iframe on purpose: a frame would need a page, a message
channel and a second hydration for every card, and the block is already a component that takes plain data. A sample's pictures are `data:`
URLs, so drawing a thumbnail makes no request. A block with no sample shows a short "No preview" text.

### The workspace's switch in the panel

On a workspace's page in the admin's panel (Summary tab) the layer adds a "Public page" card through core's `kit:platform:workspace-sections`
(`PublicPageWorkspaceSection`, from the plugin `public-page-workspace-section.ts`). It says whether the page is on or off and, when it is
off, since when and why. "Turn the page off" opens `PublicPageHoldDialog`, which has a reason the owner will read, optional, up to 500
characters, and two actions, Cancel and "Turn the page off"; "Turn the page on" asks to confirm and then writes. `useWorkspacePageHold` reads
the switch when the card mounts (and again if the workspace id changes), takes what the API answers after a change, tells the page that
something changed so it reads the activity again, and reads the switch again after a refusal.

### The admin's catalog

The screen `/platform/public-page` belongs to this layer but uses the `platform` layout and the admin's session: it is the admin who
decides which blocks the businesses may use. It is in the admin's menu (see [Platform](platform.md#the-admins-menu)) and answers 404 on a
workspace's host. It has two parts.

- **The page's options.** The plan feature the public page needs (none means every plan) and whether the foot shows "Made with" the
  platform's name.
- **One card per block**, in the registry's order: the block's thumbnail, its name and description, a switch (on or off for every
  workspace) and the plan feature it needs. A feature that no package declares any more stays selectable and is labelled "no longer
  exists", so the admin sees what is saved and can change it.

Nothing is saved when a control changes. `usePublicPageCatalog` keeps a draft of each block and of the options (only what the admin
touched), every one a field of the page's change set, so the action bar and the dots next to a card's name show what is pending. Save
sends only what changed, each block and the options with the version it was read at (`PATCH /platform/public-page`); the answer replaces
the catalog and drops the drafts. If someone else saved first (409 `public_page.catalog_changed`) the page reads the catalog again and
drops the drafts, so the admin sees the new state before deciding again. The drafts and the body live in `utils/catalog-drafts.ts` and
`utils/catalog-payload.ts`.
