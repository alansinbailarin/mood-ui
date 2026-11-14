# Add a settings group

A settings group is a set of values each workspace chooses for itself, saved by key with a version and a history. The
kit declares two (`identity` and `localization`, in `MoodKit\Settings\KernelSettingsProvider`). A module adds its own
with a `SettingsGroupProvider`. This guide adds a `booking` group with two keys.

## Before you start

- The permission the group asks for, if any, is declared by a `PermissionProvider`. See
  [Add a permission and a menu entry](add-a-permission-and-menu-entry.md).
- Your package loads its translations under its own namespace (here `booking`).

## 1. Declare the group

```php
<?php

declare(strict_types=1);

namespace MoodKit\Booking;

use MoodKit\Settings\Contracts\SettingKey;
use MoodKit\Settings\Contracts\SettingsGroup;
use MoodKit\Settings\Contracts\SettingsGroupProvider;

final readonly class BookingSettings implements SettingsGroupProvider
{
    public function settingsGroups(): array
    {
        return [new SettingsGroup('booking', 'booking::settings.label', 'booking::settings.description', [
            new SettingKey('slotMinutes', ['integer:strict', 'in:15,30,60'], 30, 'booking::settings.keys.slot_minutes'),
            new SettingKey('allowSameDay', ['boolean:strict'], true, 'booking::settings.keys.allow_same_day'),
        ], order: 40, permission: 'booking.view')];
    }
}
```

Every argument of `SettingsGroup` and `SettingKey` is described in
[Settings: groups and keys](../packages/settings.md#groups-and-keys). In short: the slug is lower case with `_`, keys
are camelCase and never `versions` or `confirm`, and every value sent is required and checked with the key's rules.
`permission: 'booking.view'` means a member also needs `booking.view` to see the group and to change it. Add
`editPermission: 'booking.edit'` when the group should be changed by whoever manages your module rather than by whoever
may change the workspace's settings: it then takes `booking.edit` instead of `settings.edit` (and still `booking.view`).

Use the strict rules. A value is stored as it was sent, and a save is compared with what is stored: with plain
`integer`, `"30"` passes and is stored as text, which is no longer equal to `30`. `integer:strict` and `boolean:strict`
take only JSON numbers and `true`/`false`. When you want to accept text too, cast it in a `normalize`, which runs before
the rules (`normalize: static fn (mixed $v): mixed => is_numeric($v) ? (int) $v : $v`).

## 2. Tag the provider

In your provider's `register()`:

```php
$this->app->tag([BookingSettings::class], 'settings.groups');
```

The registry checks every group on first use and throws `InvalidSettingsRegistry` on a mistake, so a wrong slug or
key fails the first request that uses settings, and the tests.

## 3. Translate the labels

In `lang/en/settings.php` and `lang/es/settings.php` of your package:

```php
return [
    'label' => 'Booking',
    'description' => 'How clients book their appointments.',
    'keys' => ['slot_minutes' => 'slot length', 'allow_same_day' => 'same-day booking'],
];
```

Settings' `GroupTranslationsTest` runs over every registered group, so a missing label in either language fails it.

## 4. Give it a section on the settings page

`/dashboard/settings` shows a group only when a frontend layer registered the component that edits it, through core's
`kit:settings:sections` hook. In your module's layer, a plugin pushes it:

```ts
// layers/booking/app/plugins/booking-settings.ts
import BookingSettingsSection from "../components/BookingSettingsSection.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:settings:sections", (sections) => {
    sections.push({ group: "booking", component: BookingSettingsSection });
  });
});
```

The page passes the component the group from `GET /settings` as its `group` prop (`slug`, `label`, `description`,
`order`, `canEdit`), in the order the API gives. Build it with core's pieces, which every layer may use:

- `useSettingsForm({ group, label, fields, schema, onSaved })` reads the group, fills a vee-validate form, saves only the
  keys of `fields` with the version each was read at, handles 409 `settings.version_mismatch` and
  `settings.confirmation_required`, and tells the page when there are changes not saved, so leaving asks first. Each
  key in `fields` has its label and, optionally, a format (core's `formatAsText`, `formatAsColor`, `formatAsTimezone`,
  `formatAsCurrency`, `formatAsLanguage`, `formatAsList`, `formatAsSet`); `label` is the group's name. They are the
  section's fields in the page's change set: the section's header shows a warning dot while it has changes, and the
  action bar's Review changes lists them before → after under that name. It registers the section with the
  page's `PageActionBar`, whose Save sends every section with changes, and gives `open` and `onSubmit` for the card
  and the form: a save the API refuses opens the section, and Enter in a field saves the page.
- `SettingsSection` is the collapsible card, with the warning dot in its header while its group has changes;
  `SettingsSectionSkeleton` shows while the group loads the first time. A section has no Save button: the page's action bar is the only one. Its `#actions` slot is for actions of its own that
  take effect at once, if any.

```vue
<!-- layers/booking/app/components/BookingSettingsSection.vue -->
<script setup lang="ts">
import { GlassSwitch, NumberInput } from "mood-ui";
import * as yup from "yup";
import type { GroupSummary } from "#layers/core/app/types/settings";

const props = defineProps<{ group: GroupSummary }>();
const { t } = useI18n();
const schema = computed(() => toTypedSchema(yup.object({ slotMinutes: yup.number().required(), allowSameDay: yup.boolean().required() })));

const { form, loader, submit, open, onSubmit } = useSettingsForm<{ slotMinutes: number; allowSameDay: boolean }, Record<string, never>>({
  group: "booking",
  label: () => props.group.label,
  fields: {
    slotMinutes: { label: () => t("booking.settings.slot_minutes"), format: formatAsText((minutes) => t("booking.settings.minutes", { n: Number(minutes) }, Number(minutes))) },
    allowSameDay: { label: () => t("booking.settings.allow_same_day"), format: formatAsText((on) => t(on ? "booking.settings.yes" : "booking.settings.no")) },
  },
  schema,
});
const { status, error, hasLoaded } = loader;
const { formError } = submit;
const [slotMinutes] = form.defineField("slotMinutes");
const [allowSameDay] = form.defineField("allowSameDay");
</script>

<template>
  <SettingsSectionSkeleton v-if="status === 'loading' && !hasLoaded" />
  <SettingsSection v-else v-model:open="open" :slug="props.group.slug" :title="props.group.label" :description="props.group.description">
    <AsyncBoundary :status="status" :error="error" :loaded="hasLoaded">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <NumberInput v-model="slotMinutes" :label="t('booking.settings.slot_minutes')" :disabled="!props.group.canEdit" />
        <GlassSwitch v-model="allowSameDay" :label="t('booking.settings.allow_same_day')" :disabled="!props.group.canEdit" />
        <FormErrorBanner :message="formError" />
      </form>
    </AsyncBoundary>
  </SettingsSection>
</template>
```

Without `settings.edit`, or the group's `editPermission` (`canEdit` false), the fields are disabled, so the section never has changes, and the settings
page shows no action bar to someone without it. The settings layer's own
sections (`IdentitySection.vue`, `LocalizationSection.vue`) are fuller models. See
[The settings layer](../packages/settings.md#the-settings-layer).
