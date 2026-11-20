# Errors and the API

Every route of the API lives under `/api/v1` and answers in one JSON envelope, success or failure. Every
failure carries a stable, dotted error code and a message already translated into the language of the
request. This page is the contract both halves of the kit rely on.

## Base URL and middleware

Packages register their routes from their service providers with the `api` middleware group and the
`api/v1` prefix. The frontend's `NUXT_PUBLIC_API_BASE_URL` already ends in `/api/v1`, so a frontend service
asks for `/tenant`, never `/api/v1/tenant`.

| Middleware | What it does | Used by |
| ---------- | ------------ | ------- |
| `tenant` | finds the workspace from `X-Tenant-Slug` or the host (see [Multi-tenancy](multi-tenancy.md)) | public routes of a workspace: login, password reset, handoff, `GET /tenant`, Team's invitation lookup and acceptance, the client portal's `GET /portal`, `POST /portal/code` and `POST /portal/session` |
| `workspace` (group) | `tenant`, then `auth:sanctum`, then the check that the token belongs to this workspace, then the user's RLS setting and locale (and, in a session of an impersonation, the super admin in the request's context), then the refusal of a `DELETE` during an impersonation | every route of a signed-in member |
| `portal` (group) | `tenant`, no cache nor referrer (`KeepOutOfCachesAndReferrers`), then Clients' `client-portal` guard asked by name (a session of `client_portal_sessions`, never a Sanctum token, and never the default guard), then whether the portal is open (403 `clients.portal_closed`), then the `portal` limiter per client | every route of a signed-in client of the portal, under `/api/v1/portal` (see [Clients](../packages/clients.md#the-session)) |
| `permission:a,b` | requires every permission listed, in this workspace | after `workspace`, on guarded routes |
| `onboarded` | refuses while the workspace's required onboarding steps are left (403 `onboarding.incomplete`) | after `workspace`, on a module's route that needs a set-up workspace |
| `not-impersonating` | refuses a super admin acting as the person (403 `auth.impersonation_forbidden`), ahead of the route's limiters; every `DELETE` of the `workspace` group refuses one too | after `workspace`, on a route that would hand the account over or touches money |
| `platform-flag:<slug>` | refuses while the platform flag is off for the request's workspace (503 `platform.flag_off`, with `meta.flag`) | a module's route that the platform's admin can switch off or roll out (see [Add a platform flag](../guides/add-a-platform-flag.md)) |
| `platform` (group) | refuses any workspace (400 `platform.tenant_context_forbidden` for an `X-Tenant-Slug` header or a workspace's host), answers only on the API's own host and the admin host (404 elsewhere, `AdminHostOnly`), then `auth:platform`: the admin host's own guard, a session of `platform_sessions`, never a Sanctum token | every route of a signed-in super admin, under `/api/v1/platform` (see [Platform](../packages/platform.md#the-admin-host)) |

A route for a signed-in member uses the `workspace` group, never `auth:sanctum` alone. Public routes have a
named rate limiter of their own (`throttle:auth-login`, `throttle:signup`, `throttle:platform-login`...), so one route's traffic never
uses up another's allowance.

The health check is `GET /up`, outside `/api`. It answers 200 on any host.

## The envelope

A success:

```json
{
  "data": { "slug": "demo", "name": "Demo" },
  "meta": {},
  "errors": []
}
```

A failure:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    { "code": "tenancy.not_found", "message": "...", "field": null }
  ]
}
```

- `data` is the resource, a list, or `null`. An empty `meta` is `{}`.
- `errors` is empty on success. Each error has a `code`, a translated `message` and the input `field` it is
  about, or `null` when it is about the whole request.
- `meta` carries extra data on either side: the pagination of a list, the permissions a role could not
  lose, the permission a request lacked.
- Keys are camelCase.

A validation failure has one error per failed rule, each with its field:

```json
{
  "data": null,
  "meta": {},
  "errors": [
    { "code": "validation.required", "message": "...", "field": "email" },
    { "code": "validation.min", "message": "...", "field": "password" }
  ]
}
```

A list built with `ApiResponse::paginated()` is paginated by page number, with a total, and puts its state in
`meta.pagination`: `page` (from 1), `perPage`, `total` (every row the list has with its filters in force) and `lastPage`
(1 for an empty list). It takes `?page=` (a whole number from 1, up to 1,000,000) and `?perPage=` (from 1; the list's own
size when none is sent, and never more than 100: a bigger one is 100). A `page` or a `perPage` that is no whole number
from 1 is 422 on that field. A page past the last answers no rows, with the same `total` and `lastPage`. A list reads
both with `ApiRequest::pageRequest()` (`Support\Contracts\PageRequest`, whose `RULES`, spread into its request's own) and
hands the query to `Paginate::of($page, $query, $default)` (Eloquent) or `Paginate::rows()` (a query builder), which counts and pages with one query:
the total never holds a row that the filters, the branch bar or the person's rights leave out. A list that has no filters
and takes nothing but its page uses `Support\Http\Requests\PagedRequest`.

Every response under `/api` carries `X-Robots-Tag: noindex`.

## Building responses

Controllers build every response with `MoodKit\Support\Http\ApiResponse`:

| Method | Sends |
| ------ | ----- |
| `ApiResponse::data($data, $meta = [], $status = 200)` | `{data, meta, errors: []}`. `data([])` is sent as `[]`, so use it for lists, never for one resource. |
| `ApiResponse::paginated($paginator, $map, $meta = [])` | a page of a `LengthAwarePaginator`, each item through `$map`, with `meta.pagination` (`page`, `perPage`, `total`, `lastPage`) |
| `ApiResponse::error($status, ...$errors)` | `{data: null, meta: {}, errors}` from `ApiError` objects. Only the exception renderer uses it. |
| `ApiResponse::errorWithMeta($status, $meta, ...$errors)` | the same with a filled `meta` |

An action that has nothing to send back (a logout, a password reset, a deleted role, a resend) answers
`ApiResponse::data(null)`: `{data: null, meta: {}, errors: []}`, with status 200, or 202 when the work was only queued
(`POST /auth/forgot-password`, `POST /auth/signup/resend`), and any `meta` it has (`invalidatedUserCount`). Never
`{ok: true}`, never `[]` (a list), never a bare 204: every answer under `/api` is an envelope.

As a safety net, the global `ForceJsonEnvelope` middleware wraps any JSON response under `/api` that is not
an envelope: below status 400 the body becomes `data`, from 400 up it becomes one generic error whose message
never comes from the body. Do not rely on it.

## Error codes

### Generic codes

`MoodKit\Support\Http\ApiExceptionRenderer` turns every exception into an envelope. Nothing internal (class
names, exception messages, stack traces) reaches the client, debug mode included.

| Status | Code |
| ------ | ---- |
| 422 | `validation.<rule>`, one per failed rule (`validation.required`, `validation.email`...), its `field` the input's name, digits included (`"0"`). A closure rule is `validation.closure_validation_rule`; extra messages of a rule that fails with several are `validation.invalid`. |
| 401 | `auth.unauthenticated` |
| 403 | `auth.forbidden` |
| 404 | `http.not_found` |
| 405 | `http.method_not_allowed` |
| 409 | `http.conflict` |
| 429 | `http.too_many_requests` |
| other 4xx | `http.error` |
| 5xx, and any unexpected exception | `server.error` |

### Domain errors

An expected business failure is a subclass of `MoodKit\Support\Errors\DomainError`. The renderer sends its
code, its message translated from its key, its status (422 unless it says otherwise), its field and its
`meta`. Domain errors are never reported to the log or Sentry: they are answers, not bugs.

| Code | Status | Package |
| ---- | ------ | ------- |
| `tenancy.required` | 400 | Tenancy |
| `tenancy.mismatch` | 400 | Tenancy |
| `tenancy.not_found` | 404 | Tenancy |
| `tenancy.suspended` | 403 | Tenancy |
| `auth.invalid_credentials` | 401 | Auth |
| `auth.membership_deactivated` | 403 | Auth: a login whose email and password are right for a membership of the workspace that was deactivated (no token is issued) |
| `auth.session_deactivated` | 401 | Auth: a request carrying the token of a session that deactivating the member ended (`meta.workspace` is the workspace's name) |
| `auth.handoff_invalid` | 401 | Auth |
| `auth.password_reset_invalid` | 400 | Auth |
| `auth.captcha_failed` | 422 | Support's `CaptchaFailed`, thrown by Auth, Signup and Clients' portal (asking for a sign-in code) |
| `validation.json_object` | 422 | Support's `ApiRequest`: a JSON body that is not an object (a list, a string; an empty `[]` is no fields), on no field |
| `auth.membership_not_found` | 404 | Auth |
| `auth.avatar_invalid_type` (field `file`) | 422 | Auth |
| `auth.avatar_too_large` (field `file`, with `meta.maxBytes`) | 422 | Auth |
| `auth.current_password_invalid` (field `currentPassword`) | 422 | Auth |
| `auth.session_not_found` | 404 | Auth |
| `auth.session_is_current` | 422 | Auth |
| `auth.impersonation_forbidden` | 403 | Support (Auth's guards, Team's onboarding step): a super admin acting as the person may not do this (it would hand the account over, touch money or delete) |
| `auth.not_impersonating` | 409 | Auth: Exit from a session that is the person's own |
| `auth.email_unchanged`, `auth.email_taken` (field `email`) | 422 | Auth |
| `auth.email_code_invalid`, `auth.email_change_invalid` (field `code`) | 422 | Auth |
| `auth.forbidden` (with `meta.requiredPermission`) | 403 | Rbac's `permission` middleware |
| `rbac.role_not_found` | 404 | Rbac |
| `rbac.user_not_found` | 404 | Rbac |
| `rbac.role_is_system` | 409 | Rbac |
| `rbac.role_has_users` (with `meta.usersCount`) | 409 | Rbac |
| `rbac.role_not_grantable` | 403 | Rbac |
| `rbac.above_your_role` | 403 | Rbac: changing the role of a member whose current role the person could not give themselves (a manager on another manager) |
| `rbac.permission_unknown`, `rbac.owner_critical_not_grantable` (field `permissions`, with `meta.permissions`) | 422 | Rbac |
| `rbac.owner_critical_perm_locked` (field `permissions`, with `meta.missing`) | 422 | Rbac |
| `rbac.role_not_editable`, `rbac.role_not_in_tenant`, `rbac.last_owner`, `rbac.cannot_change_own_role`, `rbac.slug_already_exists`, `rbac.name_already_exists`, `rbac.no_audit_entry_to_undo` | 422 | Rbac |
| `signup.email_taken` (field `email`) | 422 | Signup |
| `signup.password_mismatch` (field `password`) | 422 | Signup |
| `signup.token_unknown` | 404 | Signup |
| `signup.closed` | 403 | Signup: a gate lets no new workspace in without an invitation (when the signup starts or its email is confirmed) |
| `signup.invite_invalid` (field `invite`) | 422 | Signup: the invitation is unknown, expired, used, taken away or another email's |
| `settings.group_not_found` | 404 | Settings |
| `settings.version_mismatch` (with `meta.currentVersions`) | 409 | Settings |
| `settings.confirmation_required` (with `meta.impacts`) | 409 | Settings |
| `settings.logo_invalid_type`, `settings.logo_too_large` (field `file`, or `sizeBytes` and `objectKey` when uploading straight to the bucket) | 422 | Settings |
| `settings.logo_empty` (field `file` or `objectKey`) | 422 | Settings |
| `settings.logo_key_invalid`, `settings.logo_not_uploaded` (field `objectKey`) | 422 | Settings |
| `settings.logo_presign_disabled` | 404 | Settings |
| `plans.feature_not_included` (with `meta.feature`, `meta.plan`, `meta.upgradeAvailable`) | 403 | Plans' `feature.enabled` middleware |
| `plans.invalid_transition` (with `meta.from`, `meta.to`) | 409 | Plans |
| `plans.quota_exceeded` (with `meta.resource`, `meta.limit`, `meta.used`, `meta.plan`, `meta.upgradeAvailable`, `meta.scheduledPlan`) | 422 | Plans: over the limit of the plan, or of the plan it moves down to at the end of the period (`meta.scheduledPlan`) |
| `plans.subscription_missing` | 404 | Plans |
| `notifications.version_mismatch` (with `meta.currentVersions`) | 409 | Notifications |
| `notifications.unknown_event_type`, `notifications.channel_unavailable`, `notifications.unknown_audience`, `notifications.attachment_not_offered` (field `settings.<n>.*`, `audiences.<n>.*`, or `eventType`, `channel` and `audience` of a template) | 422 | Notifications |
| `notifications.unknown_variables` (field `subject` or `body`, with `meta.variables`) | 422 | Notifications |
| `notifications.delivery_not_found` | 404 | Notifications |
| `notifications.inbox_item_not_found` | 404 | Notifications' inbox: also for an item of another person or workspace |
| `notifications.channel_not_resendable`, `notifications.not_resendable`, `notifications.recipient_opted_out`, `notifications.recipient_suppressed`, `notifications.recipient_gone` | 422 | Notifications |
| `notifications.resend_limit` (with `meta.retryAfterSeconds`) | 429 | Notifications |
| `notifications.webhook_refused` | 403 | Notifications' bounce webhook |
| `notifications.webhook_not_found` | 404 | Notifications' bounce webhook |
| `notifications.channel_forbidden` | 403 | Notifications' realtime sign-in: a channel other than the person's own in the workspace of their token |
| `notifications.realtime_off` | 503 | Notifications' realtime sign-in, with `BROADCAST_CONNECTION` not `reverb` |
| `notifications.link_invalid` | 404 | Notifications' public preference center and one-click unsubscribe: every bad token (changed, another key, expired, a workspace that is gone, the wrong kind of link) |
| `notifications.unknown_category`, `notifications.mode_not_offered` (field `preferences.<n>.category`, `.channel` or `.mode`) | 422 | Notifications' preferences: a category with nothing to choose about, a channel it does not use or a mode it does not offer there |
| `onboarding.not_found`, `onboarding.step_not_found` | 404 | Onboarding |
| `onboarding.step_required`, `onboarding.already_completed` | 409 | Onboarding |
| `onboarding.prerequisites_missing` (with `meta.steps`) | 409 | Onboarding |
| `onboarding.required_steps_pending` (with `meta.steps`) | 409 | Onboarding |
| `onboarding.incomplete` (with `meta.steps`) | 403 | Onboarding's `onboarded` middleware |
| `billing.not_configured` | 503 | Billing: no Stripe secret key (or no webhook signing secret) on this installation |
| `billing.stripe_unavailable` | 502 | Billing: Stripe refused a call or did not answer it |
| `billing.webhook_refused` | 400 | Billing's webhook: not signed by Stripe with the endpoint's secret, signed too long ago, or no event |
| `billing.already_subscribed` | 409 | Billing: the workspace already pays through Stripe; it changes its plan instead |
| `billing.plan_not_offered` (field `plan`) | 422 | Billing: the plan is not available, or Stripe does not offer it for that billing period at the catalog's price |
| `billing.plan_too_small` (field `plan`, with `meta.plan`, `meta.excesses`) | 422 | Billing: the workspace uses more than the plan allows |
| `billing.no_customer` | 409 | Billing: the workspace never checked out, so it has no billing portal |
| `billing.checkout_not_found` | 404 | Billing: no such checkout, or it is another workspace's |
| `billing.no_subscription` | 409 | Billing: the workspace does not pay through Stripe yet; it checks out first |
| `billing.plan_granted` | 409 | Billing: the workspace is on a plan the platform gave; no checkout or change of plan until it ends |
| `platform.tenant_context_forbidden` | 400 | Platform: a request to the admin's API that names a workspace (the `X-Tenant-Slug` header, or a workspace's host) |
| `platform.workspace_not_found` | 404 | Platform: no workspace has that id, or it was deleted |
| `platform.workspace_unavailable` | 409 | Platform: the workspace's standing does not allow it now (resuming one that is closing, entering one that is suspended or closing, giving a plan to one that is closing) |
| `platform.workspace_billed_by_stripe` | 409 | Platform: a plan is never given over a subscription Stripe bills |
| `platform.no_plan_grant` | 409 | Platform: the workspace is on no plan the platform gave, so there is nothing to take back |
| `platform.plan_not_grantable` | 422 | Platform: the plan to give is not in the catalog, or is the default plan (field `plan`) |
| `platform.grant_ends_in_past` | 422 | Platform: the end chosen for a plan given had passed by the time it was written, under the workspace's lock (field `endsAt`) |
| `platform.plan_not_found` | 404 | Platform: no plan of the catalog has that slug |
| `platform.plan_changed` (with `meta.currentVersion`) | 409 | Platform: someone saved the plan since it was read; load it again |
| `platform.plan_change_unconfirmed` (with `meta.impacts`, `meta.workspaces`, `meta.confirmationToken`) | 409 | Platform: the change takes something from the workspaces on the plan (a price, a lower limit, a feature); send it again with `confirm: true` and the `confirmationToken`, which confirms that change of that version only |
| `platform.default_plan_on_sale` (field `available`) | 422 | Platform: taking the default plan off sale |
| `platform.plan_slug_taken` (field `slug`) | 422 | Platform: a plan, maybe one no longer for sale, already has that slug |
| `platform.plan_order_invalid` (field `order`) | 422 | Platform: an order of the catalog names a plan twice, or one nobody has |
| `platform.catalog_not_editable` | 503 | Platform: no catalog writer is set up (`DB_CATALOG_USERNAME`), or it cannot sign in, so the plans can be read in the admin, not changed |
| `platform.prices_not_offered` (with `meta.pending`) | 502 | Platform: Stripe did not take a plan's prices offered again; the periods in `meta.pending` are not sold meanwhile |
| `platform.stripe_not_configured` | 503 | Platform: offering a plan's prices again with no Stripe set up here |
| `platform.workspace_not_closing` | 409 | Platform: reopening a workspace that is not closing |
| `platform.grace_over` | 409 | Platform: reopening a closed workspace whose grace is over (its deletion is due) |
| `platform.member_not_found` | 404 | Platform: entering a workspace as someone who is not its active member |
| `platform.impersonation_of_admin` | 403 | Platform: entering a workspace as another super admin |
| `platform.flag_off` (with `meta.flag`) | 503 | Platform's `platform-flag` middleware, and entering a workspace as a member while `platform.impersonation` is off |
| `platform.flag_unknown` (field `flags.N.slug`) | 422 | Platform: saving a flag no package declares |
| `platform.rollout_not_offered` (field `flags.N.rolloutPercent`) | 422 | Platform: a percentage for a flag that is only on or off |
| `platform.version_mismatch` (with `meta.currentVersions`) | 409 | Platform: someone saved the same flags or settings a moment ago |
| `platform.logo_invalid` (field `logo`) | 422 | Platform: the platform's logo is not a PNG, JPEG or WebP image |
| `platform.waitlist_closed` | 403 | Platform: the public waitlist, while the access mode is not `waitlist` |
| `platform.waitlist_entry_not_found` | 404 | Platform: no one on the waitlist has that id |
| `platform.invitation_not_found` | 404 | Platform: no invitation has that id |
| `platform.email_has_account` (field `email`) | 422 | Platform: inviting an email that already has an account |
| `team.role_not_grantable` (field `roleId`) | 422 | Team: inviting with a role the person may not give, or sending again an invitation of such a role |
| `team.already_member` (field `email`) | 422 | Team: inviting an email that has a place in the workspace, active or not |
| `team.already_invited` (field `email`) | 422 | Team: inviting an email whose invitation still waits |
| `team.invitation_not_found` | 404 | Team: no invitation of the workspace has that id |
| `team.invitation_not_pending` | 409 | Team: sending again or withdrawing an invitation that was accepted or withdrawn already |
| `team.invitation_invalid` | 404 | Team: looking at or accepting an invitation whose link does not work (unknown, of another workspace, expired, used, withdrawn, whose inviter no longer stands behind it, or of an email that can no longer join), all alike |
| `team.password_reset_elsewhere` | 422 | Team: accepting with a new password (`replacePassword`) for an account no reset link reaches: a super admin of the platform, or someone with no active place in any workspace |
| `team.account_exists` | 409 | Team: accepting as a new person when the email got an account in the meantime |
| `team.member_not_found` | 404 | Team: the person has no place in the workspace, active or inactive; also from a package that uses `MemberAccess` (Branches) |
| `team.cannot_act_on_self` | 422 | Team: deactivating, reactivating or removing oneself |
| `team.owner_only` | 403 | Team: someone who is not an owner deactivating, reactivating or removing an owner, or setting their hours or skills; also from a package that uses `MemberAccess` (Branches) |
| `team.above_your_role` | 403 | Team: acting on a member (deactivate, reactivate, remove, hours, skills) or withdrawing an invitation whose role the person could not give themselves (a manager on another manager); also from a package that uses `MemberAccess` (Branches) |
| `team.member_not_active` | 409 | Team: deactivating a member who is inactive already |
| `team.member_not_inactive` | 409 | Team: reactivating a member who is active already |
| `team.skill_not_found` | 404, or 422 on `skillIds` | Team: no skill of the workspace has that id (in the path: 404; in a member's list: 422) |
| `team.skill_taken` (field `name`) | 422 | Team: the workspace has a skill with that name already, whatever its case |
| `team.skills_full` | 422 | Team: the catalog of skills is full (`meta.max`) |
| `team.too_many_skills` (field `skillIds`) | 422 | Team: more skills for one member than the cap (`meta.max`) |
| `branches.not_found` | 404 | Branches: no branch of the workspace has that id (another workspace's, or not an id) |
| `branches.name_taken` (field `name`) | 422 | Branches: the workspace has a branch with that name already, whatever its case |
| `branches.slug_taken` (field `slug`) | 422 | Branches: another branch of the workspace has that slug |
| `branches.not_active` | 409 | Branches: deactivating a branch that is inactive already |
| `branches.not_inactive` | 409 | Branches: reactivating a branch that is active already |
| `branches.member_not_found` (field `userIds`) | 422 | Branches: putting on a branch someone with no place in the workspace |
| `branches.in_use` | 409 | Branches: deleting a branch a module's row holds on to (`restrictOnDelete()`, or a key with no action); deactivate it instead |
| `branches.not_selectable` (field `branchId`) | 422 | Branches: choosing a branch to work at that is not one of yours (closed, someone else's, another workspace's, no branch at all), every branch without `branches.all`, or any while the workspace does not work by branch |
| `clients.not_found` | 404 | Clients: no client the person may see has that id: not there, another workspace's, in the trash, erased, or of a home branch they do not see, all alike |
| `clients.duplicate` (field `email` or `phone`) | 409 | Clients: another live client of the workspace has that email or phone; `meta.clientId` names it only to someone who may see it (no home branch, or one they may see), and never when the database caught a race |
| `clients.branch_not_allowed` (on the field that asked) | 422 | Clients: a branch the person may not choose as a home branch (`homeBranchId`: not active, not one they may see, another workspace's, or not there, all alike) or filter the list by (`branch`: one they may not see) |
| `clients.tag_not_found` | 404, or 422 on the field | Clients: no tag of the workspace has that id (in the path: 404; in a body's list of tag ids: 422 on that field) |
| `clients.tag_taken` (field `name`) | 422 | Clients: another tag of the workspace has that name, whatever its case |
| `clients.tag_needs_all_branches` | 403 | Clients: changing or deleting a tag of the catalog, by someone who does not see every branch (clients out of their sight may carry it) |
| `clients.tags_full` | 422 | Clients: the workspace's catalog of tags is full, or would be with the new tags an import's lines name (`meta.limit`) |
| `clients.too_many_tags` (on the field that asked) | 422 | Clients: a client's tags would grow past the cap (`meta.limit`) |
| `clients.selection_changed` (field `clientIds`) | 422 | Clients: a client of a bulk change is in the trash, erased, another workspace's, not there or of a home branch the person does not see; nothing changed |
| `clients.merge_same` (field `sourceId`) | 422 | Clients: merging a client with itself |
| `clients.merge_notes_too_long` (field `sourceId`) | 422 | Clients: the notes of the two clients of a merge, joined, are longer than a client's notes may be; nothing merged |
| `clients.export_too_large` | 422 | Clients: the list asked for has more clients than one CSV export may hold (`meta.limit`); nothing was sent |
| `clients.import_not_found` | 404 | Clients: no import of the person has that id: not there, another workspace's, someone else's (the owner's included), or not an id, all alike |
| `clients.import_invalid_file` (field `file`) | 422 | Clients: a file to import that is not text (or an uploaded file that no longer decrypts), whose first row does not name every column once or has a header over 100 characters, with a row of more columns than `clients.import.max_columns`, or with no clients under its headers; the message says which |
| `clients.import_too_large` (field `file`) | 422 | Clients: a file to import is larger than `clients.import.max_bytes`, or than PHP's `upload_max_filesize` (`meta.maxBytes`, the lower); a whole request over `post_max_size` is 413 `http.error` instead |
| `clients.import_too_many_rows` (field `file`) | 422 | Clients: a file to import brings more clients than an import takes (`meta.limit`) |
| `clients.import_mapping_invalid` (field `mapping`) | 422 | Clients: an import's mapping with no column for the name, a field that is not one, a header the file does not have, or one header for two fields |
| `clients.import_wrong_state` | 409 | Clients: an import previewed or run once it has started (queued, running or done), or once its upload is past its `expiresAt`; upload the file again |
| `clients.portal_code_invalid` (field `code`) | 422 | Clients: a sign-in code of the client portal that does not work, whatever the reason (wrong, run out or forgotten after too many wrong tries, used up, an email with no code, a client in the trash, erased or whose email changed, a closed portal), all alike; ask for a new one |
| `clients.portal_closed` | 403 | Clients: a signed-in client's request to a portal that closed since they signed in (the workspace closed it, or its plan no longer includes it); the session stays, and works again if the portal opens before it ends |
| `clients.portal_phone_unavailable` (field `phone`) | 422 | Clients: a client in the portal changing their phone to one another live client of the workspace has (found first, or caught by the database in a race); it never says whose, and nothing changed |
| `geocoding.unavailable` | 503 | Geocoding: the map's provider did not answer, or answered an error; type the address or place the pin |
| `geocoding.busy` | 429 | Geocoding: the provider's pace for the whole app (Nominatim: one request per second) is spent; try again in a moment |
| `http.too_many_requests` (too many password checks for one signup secret) | 429 | Signup |

The package pages list when each one happens.

To add one, subclass `DomainError` in your package and put its message in the package's
`lang/{en,es}/errors.php`:

```php
<?php

declare(strict_types=1);

namespace MoodKit\Billing\Errors;

use MoodKit\Support\Errors\DomainError;

final class InvoiceAlreadySent extends DomainError
{
    public function errorCode(): string
    {
        return 'billing.invoice_already_sent';
    }

    public function messageKey(): string
    {
        return 'billing::errors.invoice_already_sent';
    }

    public function status(): int
    {
        return 409;
    }
}
```

Throw it from an Action; never catch it in a controller. Override `field()` when the failure is about one
input and `meta()` when the client needs data about it. Placeholders of the message go to the constructor:
`throw new InvoiceAlreadySent(['number' => $invoice->number])`. Once shipped, never change a code.

## Naming

What the API and the packages name, and how. A module follows the same patterns.

| What | Pattern | Examples |
| ---- | ------- | -------- |
| A package's error code | `<package>.<what went wrong>`, the package in lowercase | `rbac.last_owner`, `settings.version_mismatch`, `tenancy.suspended`, `auth.membership_not_found` |
| A shared error code | the family Support and the renderer give every package | `validation.<rule>`, `http.not_found`, `server.error`, `auth.unauthenticated`, `auth.forbidden`, `auth.captcha_failed` |
| An audit action | `<package>.<resource>.<what happened>`, in the past tense, a constant of the package's `AuditEntries` | `rbac.role.updated`, `settings.group.updated`, `settings.logo.removed`, `signup.workspace.provisioned` |
| An audit resource type | the resource's name, a constant of the package's `AuditEntries` | `Role`, `UserRole`, `SettingsGroup`, `TenantLogo`, `Workspace` |
| A permission | `<module>.<action>` | `rbac.view`, `settings.edit` |
| A named limiter | `<package>-<what it counts>`, or the package alone for its one limiter | `auth-login`, `settings-logo`, `signup-verify`, `onboarding`, `platform-login`, `platform-impersonation`, `platform` |
| A route | the resource in the plural, nested by `/`: `GET` reads, `POST` creates or acts (`/undo`, `/presign`, `/switch`), `PATCH` changes part of a resource, `PUT` replaces it whole, `DELETE` removes it | `PATCH /rbac/roles/{role}`, `PATCH /settings/{group}` (the keys sent, each with its version), `PUT /users/{user}/role` (the one role, replaced), `PATCH /me/locale` |
| A field of a body or an answer | camelCase | `captchaToken`, `invalidatedUserCount` |
| A message key | `<package>::<file>.<key>` | `rbac::errors.last_owner`, `auth::mail.reset.subject` |
| An event | what happened, in the past tense, in the package's `Events\` | `MembershipRemoved`, `SettingsChanged`, `WorkspaceProvisioned` |

## Language of the answer

The API answers in the best match of the `Accept-Language` header among `support.locales`
(`backend/packages/Support/config/support.php`: `en` and `es`); with no match, in the first one. For a
signed-in member who chose a language, their own replaces it for the rest of the request, errors included.
The frontend sends its active locale on every request. See [Add a locale](../guides/add-a-locale.md).

## On the frontend

`useApi().request()` (layer `core`) is the only code that calls the API. It adds the base URL and the
headers, gives each call 15 seconds (retries included; pass `timeout` in milliseconds to change it), and
turns every failure into an `ApiRequestError` that always carries a failure envelope, even when the server
sent none. Failures with no envelope get a client code:

| Code | When |
| ---- | ---- |
| `network.unreachable` | no response at all |
| `network.timeout` | the time limit ran out |
| `request.aborted` | the caller cancelled through its `signal`. Not a failure: nothing is shown. |
| `client.unexpected_response` | a response that is not an envelope, such as a gateway's HTML page |

`useApiError().describe(error)` keeps the backend's message. When there is none it picks one by what went
wrong: `core.errors.network`, `timeout`, `forbidden` (403), `conflict` (409), `rate_limit` (429),
`server_error` (5xx) or `unknown`.

Views do not catch errors themselves. They run services inside the request composables of `core`, which
show the failure:

| Composable | Shows a failure as |
| ---------- | ------------------ |
| `useAsyncState`, `useListQuery` | the `error` of `<AsyncBoundary>`, with a retry |
| `useFormSubmit` | field errors on their inputs, the rest as `formError` for `<FormErrorBanner>`; `formMeta` and `formCode` carry the failure's `meta` and first code |
| `useAction` | a toast with the backend's message |

A 401 from any request also fires the `kit:api:unauthenticated` hook in the browser. The auth layer ends
the session only when the code is `auth.unauthenticated` or `auth.session_deactivated` (the member's access was turned off:
the person lands on `/access-off`, which says so, not on the sign-in page); a refused sign-in or a spent handoff code is a 401
too, and leaves the session alone. A failed captcha is not a 401: it is 422 `auth.captcha_failed`. See [Frontend](../frontend.md#calling-the-api).
