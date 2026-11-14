# Attach data to members

A module often keeps something about each person of a workspace: their shifts, an hourly rate, the equipment they carry.
This guide shows how to keep it so that it lives and dies with the person's place in the workspace, how to read the
people without touching Auth's models, and how to show it on a member's page next to Team's hours and skills.

## 1. The table

Give the table `tenant_id` and `user_id`, with a composite foreign key to `memberships (tenant_id, user_id)` that cascades,
and turn on row-level security. Team's `team_member_hours` is the example:

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use MoodKit\Support\Database\TenantRls;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_member_hours', function (Blueprint $table): void {
            $table->uuid('tenant_id');
            $table->uuid('user_id');
            $table->unsignedSmallInteger('weekday');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->timestampsTz();
            $table->primary(['tenant_id', 'user_id', 'weekday']);
            $table->foreign(['tenant_id', 'user_id'], 'team_member_hours_membership_foreign')
                ->references(['tenant_id', 'user_id'])->on('memberships')->cascadeOnDelete();
        });

        DB::statement('ALTER TABLE team_member_hours ADD CONSTRAINT team_member_hours_span_check CHECK (ends_at > starts_at)');
        TenantRls::enable('team_member_hours');
    }

    public function down(): void
    {
        Schema::dropIfExists('team_member_hours');
    }
};
```

What this buys you:

- **Removing someone removes their rows.** Team's `DELETE /team/members/{user}` deletes the membership, and the cascade
  takes your rows with it, in the same transaction. Nothing to listen for, nothing left behind.
- **Nobody without a place can have a row.** The foreign key is checked by Postgres, so a user of another workspace, or
  one who left, is refused even if your code forgets to check.
- **A workspace sees only its own rows.** `TenantRls::enable()` turns on row-level security with `FORCE`, and
  `php artisan tenancy:verify-rls` fails the build on a tenant table without it.

When the row points at another row of the workspace (a skill, a shift type), point at it by `(tenant_id, id)` as well,
with a unique index on `(tenant_id, id)` in the other table: then no workspace can point at another's. Team's
`team_member_skills` does that with `team_skills`.

Deactivating someone keeps their rows: they are still part of the team, only unable to sign in.

## 2. Reading the people

Read the people of a workspace through contracts, never through Auth's or Rbac's models:

| What | Contract |
| ---- | -------- |
| one member, or a page of them, by words, status and a list of ids | `MoodKit\Auth\Contracts\ListsMembers` (`find`, `page` with `MemberFilters`) |
| names and emails by id | `MoodKit\Auth\Contracts\MemberDirectory` |
| each one's role, whether someone owns the workspace | `MoodKit\Rbac\Contracts\MemberRoles` |
| a member's working week (Support's `MoodKit\Support\Contracts\Hours\WeeklyHours`) | `MoodKit\Team\Contracts\ReadsWorkingHours` |
| each one's skills, and who has a skill | `MoodKit\Team\Contracts\ReadsSkills` |

All are asked as the workspace, with its id first. `ReadsWorkingHours` answers wall-clock times of the workspace's
timezone; see [Team](../packages/team.md#for-a-module-readsworkinghours) for how to turn them into moments.

## 3. Reacting to someone who leaves

The cascade already removes your rows. When you need more (cancel what they had booked, tell someone), listen for:

- `MoodKit\Team\Events\TeamMemberRemoved`, sent after the commit, with who they were (`name`, `email`, `locale`) and who
  removed them: they are no member any more, so Auth cannot tell you;
- or Auth's `MembershipRemoved`, sent inside the removal's transaction, for a cache that must forget them at once.

## 4. Showing it on the member's page

The `team` layer's member page (`/dashboard/team/[id]`) asks the layers for its sections through core's
`kit:team:member-sections` hook. Team registers "Working hours" (order 10) and "Skills" (order 20); a module pushes its
own from a plugin of its layer:

```ts
// layers/shifts/app/plugins/team-member-sections.ts
import MemberShiftsSection from "../components/MemberShiftsSection.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:team:member-sections", (sections) => {
    sections.push({ id: "shifts", order: 30, component: MemberShiftsSection });
  });
});
```

The component gets two props: `memberId` (the user's id) and `editable` (whether the person looking may change it).
To save with the page's bar, as "Working hours" does, register with core's `useSaverEntry`: the bar is there for whoever
may edit the member (`canEdit`), its Save is enabled while any section has changes, and it sends every section's. Register
the section's fields in the page's change set too (`useChangeSet()?.group(id, label).field(key, { label, original, current
})`), so its title can show `<UnsavedDot :group="id" />` and Review changes lists them, and mark the group with
`useDirtySections().mark(id, dirty)` so leaving with changes asks first; Team's `WorkingHoursSection.vue` and
`MemberSkillsSection.vue` are the model.

```vue
<script setup lang="ts">
const props = defineProps<{ memberId: string; editable: boolean }>();

const { t } = useI18n();
const services = useShiftsServices();
const { data } = useAsyncState(() => services.memberShifts(props.memberId));
const draft = ref<string | null>(null);
const isDirty = computed(() => draft.value !== null && draft.value !== data.value?.pattern);

useSaverEntry({
  group: `shifts:${props.memberId}`,
  isDirty,
  save: async () => {
    if (draft.value === null) return true;
    await services.saveMemberShifts(props.memberId, { pattern: draft.value });
    draft.value = null;
    return true;
  },
  discard: () => {
    draft.value = null;
  },
});
</script>

<template>
  <SurfaceCard :framed="false">
    <SurfaceCardBody>
      <Typography variant="title">{{ t("shifts.member.title") }}</Typography>
      <Input
        id="member-shifts-pattern"
        class="mt-4"
        :model-value="draft ?? data?.pattern ?? ''"
        :label="t('shifts.member.pattern')"
        :disabled="!editable"
        @update:model-value="(value) => (draft = value)"
      />
    </SurfaceCardBody>
  </SurfaceCard>
</template>
```

## 5. The routes

Give the module's routes `permission:team.manage` to change a member's data (or a permission of the module's own), a named
limiter, and decide whether a super admin acting as someone may use them: every new write route of the `workspace` group
goes in one of the two lists of `backend/tests/Architecture/ImpersonationRoutesTest.php`, which fails until it does.
Team lets an impersonation change hours and skills (support may need to; the trail names the admin) and refuses it
everything about a member's place.

Who may change a member's data is Team's rule, the one it applies to hours and skills: ask
`MoodKit\Team\Contracts\MemberAccess::ensureCanEdit()` before you write, and take the member's lock with `hold()` inside
the transaction, before any lock of your own:

```php
$access->ensureCanEdit($tenantId, $actorId, $userId);

DB::transaction(function () use ($access, $tenantId, $userId, $shifts): void {
    $access->hold($tenantId, $userId);
    Shift::query()->where('tenant_id', $tenantId)->where('user_id', $userId)->delete();
    Shift::query()->insert($shifts);
});
```

It answers Team's errors (`team.member_not_found`, `team.owner_only`, `team.above_your_role`), so the page treats them as it
does on Team's own routes.
