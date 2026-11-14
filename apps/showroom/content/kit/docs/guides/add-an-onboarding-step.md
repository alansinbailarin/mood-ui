# Add an onboarding step

A module that needs something from a new workspace before it is useful (its first location, its opening hours, the people
who work there) adds an **onboarding step**. The owner goes through it in the setup wizard after signup; what is left
shows on the dashboard's checklist.

## 1. Declare it

```php
use MoodKit\Onboarding\Contracts\OnboardingStep;
use MoodKit\Onboarding\Contracts\StepProvider;

final readonly class TeamOnboardingProvider implements StepProvider
{
    public function onboardingSteps(): array
    {
        return [
            new OnboardingStep(
                slug: 'team.invite',
                labelKey: 'team::steps.invite.label',
                descriptionKey: 'team::steps.invite.description',
                handler: InviteTeamStep::class,
                order: 100,
                permission: 'team.invite',
            ),
        ];
    }
}

// In the module's service provider:
$this->app->tag([TeamOnboardingProvider::class], 'onboarding.steps');
```

- `slug` is `<module>.<step>`, snake case. The frontend registers the step's screen for it.
- `order`: the kernel's steps are 10 (the workspace's profile, required) and 20 (its appearance); a module's go from 100.
- `required: true` for a step the workspace cannot do without. It cannot be skipped. Until it is done, the dashboard sends
  whoever may onboard to the wizard, and the routes behind `onboarded` refuse (see
  [Onboarding](../packages/onboarding.md#what-a-required-step-holds-back)). Make a step required only when the module is
  useless without it.
- `prerequisites`: required steps of a lower order that must be done first (`['workspace.profile']`).
- `permission`: what a member needs, besides `onboarding.manage`, to do it: the permission of what it writes. Without it
  the step shows read-only. When one permission does not say it (the step writes what two permissions guard, or what
  another package decides), the handler also implements `AuthorizesStep` and returns the permission the member lacks from
  `missingPermission($tenantId, $userId)`, as the kernel's steps do with Settings' `ChecksSettingsAccess`.

Every label key needs a line in each language of `support.locales`.

## 2. Write its handler

Team's own step is the example: it writes through the package's action (`InviteMember`, the one the Team page uses), so
the step obeys the same rules, the plan's quota and the audit, and puts a refusal about a field on that row's field.

```php
use MoodKit\Onboarding\Contracts\StepHandler;
use MoodKit\Support\Errors\DomainError;

final readonly class InviteTeamStep implements StepHandler
{
    public function __construct(private InviteMember $invite, private Config $config) {}

    public function rules(): array
    {
        return [
            'invitations' => ['present', 'array', 'list', 'max:'.(int) $this->config->get('team.onboarding_invitations')],
            'invitations.*' => ['array:email,roleId'],
            'invitations.*.email' => ['required', 'string', 'ascii', 'email:strict', 'max:190', 'distinct:ignore_case'],
            'invitations.*.roleId' => ['required', 'string', 'uuid'],
        ];
    }

    public function attributes(): array
    {
        return ['invitations' => 'team::validation.attributes.invitations', 'invitations.*.email' => 'team::validation.attributes.email'];
    }

    public function values(string $tenantId): array
    {
        return ['invitations' => []];
    }

    public function handle(string $tenantId, string $userId, array $input): void
    {
        foreach (array_values($input['invitations']) as $row => $invitation) {
            try {
                $this->invite->handle($tenantId, $userId, $invitation['email'], $invitation['roleId']);
            } catch (DomainError $refused) {
                $field = $refused->field();

                // `team.already_member` on `email` becomes the same code on `invitations.1.email`.
                throw $field === null ? $refused : new RowRefused($refused, "invitations.{$row}.{$field}");
            }
        }
    }
}
```

- `rules()` say what the step's form sends; a field at the top of the body they do not name is refused. A nested rule
  names its top field (`items.*.name` takes `items`), and a field sent with a dot in its name (`items.0.name`) is refused
  as one the step does not take. `attributes()` name each field in messages (translation keys).
- `values()` is what the form starts with: what is saved now. Only a member who may do the step gets it (`canComplete`;
  the others get `{}`), but never return a secret all the same. If it throws, the failure is reported and the step goes
  out with `{}`.
- `handle()` does the work, as the workspace, inside the transaction that records the step as done: if it throws,
  neither is kept, and a `ValidationException` lands on the form's fields. Write through your module's own actions, with
  their rules, quotas (`ensureCanCreate`) and audit, as the module's own screens do. A mail your action queues waits for
  the commit (the queue's `after_commit`), so a step that fails halfway mails nobody. A `DomainError` with a field lands
  on that field: when the form has rows, put it on the row's field, keeping its code, as `RowRefused` does above.
- A step can be done more than once while the onboarding goes on (the wizard's Back), so `handle()` saves what it is
  given, it does not add to what is there.

The registry checks it all the first time it is read; `OnboardingTranslationsTest` checks every label in every language.

## 3. Give it a screen

The step's screen is a component of your module's layer, registered for its slug through core's `kit:onboarding:steps`.
Build its form with core's `useOnboardingStepForm()`: it starts with the step's `values()`, and the wizard's Continue
sends it to the step's `handle()`. The screen has no button of its own.

```ts
// layers/team/app/plugins/onboarding-steps.ts
import InviteTeamStep from "../components/InviteTeamStep.vue";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("kit:onboarding:steps", (steps) => {
    steps.push({ step: "team.invite", component: InviteTeamStep });
  });
});
```

```vue
<!-- layers/team/app/components/InviteTeamStep.vue -->
<script setup lang="ts">
import { TagInput } from "mood-ui";
import * as yup from "yup";

const { t } = useI18n();
const schema = computed(() => toTypedSchema(yup.object({ emails: yup.array(yup.string().email(t("team.invite.email_invalid"))).max(20) })));
const { form, formError, onSubmit, readOnly } = useOnboardingStepForm<{ emails: string[] }>({ schema });
const [emails] = form.defineField("emails");
</script>

<template>
  <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
    <TagInput v-model="emails" :label="t('team.invite.emails_label')" :error-text="form.errors.value.emails" :disabled="readOnly" full-width />
    <FormErrorBanner :message="formError" />
  </form>
</template>
```

The wizard draws the step's title and line above the screen, and Back, Skip (for an optional step) and Continue under it.
A step with no screen shows that it cannot be done there.
