# Add a workspace template

A **workspace template** is what a new workspace starts with: a brand color, a default currency, a module's starting
records (the categories of a booking module, the tags of a CRM). It is applied once, when the workspace is made, inside
the transaction that makes it.

## 1. Declare it

```php
use MoodKit\Onboarding\Contracts\TemplateProvider;
use MoodKit\Onboarding\Contracts\WorkspaceTemplate;

final readonly class StudioTemplates implements TemplateProvider
{
    public function workspaceTemplates(): array
    {
        return [
            new WorkspaceTemplate('studio', 'studio::templates.studio', [
                'settings' => [
                    'identity' => ['primaryColor' => '#0f766e'],
                    'localization' => ['currency' => 'MXN'],
                ],
                'booking.service_categories' => ['categories' => ['Haircut', 'Beard', 'Color']],
            ]),
        ];
    }
}

// In the module's service provider:
$this->app->tag([StudioTemplates::class], 'onboarding.templates');
```

Then name it in `.env`: `ONBOARDING_TEMPLATE=studio`. Every workspace made from then on starts with it; the ones that
exist already are left as they are. `php artisan onboarding:verify` (in the deploy script) fails on a slug no package
declares and on a payload its section refuses, so the deploy stops before a signup meets either.

## 2. Use the sections there are, or add one

The kernel brings one section, `settings`: values of settings groups by group and key, saved through Settings with its
rules, history and audit. Leave `localization.locale` out: a new workspace gets the language its owner signed up in.

A module that has its own starting records adds a section:

```php
use MoodKit\Onboarding\Contracts\TemplateSection;
use MoodKit\Onboarding\Contracts\TemplateSectionHandler;
use MoodKit\Onboarding\Contracts\TemplateSectionProvider;

final readonly class BookingTemplateSections implements TemplateSectionProvider
{
    public function templateSections(): array
    {
        return [new TemplateSection('booking.service_categories', ServiceCategoriesSection::class, order: 100)];
    }
}

final readonly class ServiceCategoriesSection implements TemplateSectionHandler
{
    public function __construct(private CreatesServiceCategories $categories) {}

    public function rules(): array
    {
        return ['categories' => ['required', 'array', 'max:20'], 'categories.*' => ['string', 'max:80']];
    }

    public function apply(string $tenantId, array $payload): void
    {
        foreach ($payload['categories'] as $name) {
            $this->categories->create($tenantId, $name);
        }
    }
}

$this->app->tag([BookingTemplateSections::class], 'onboarding.template_sections');
```

- A section's slug is snake case, dots allowed (`booking.service_categories`); sections are applied by `order`.
- `rules()` checks each template's payload the first time the registry is read: a template whose payload a section
  refuses, or that names a section nobody declares, fails loudly with the template and the reason.
- `apply()` runs as the new workspace, inside its transaction. If it throws, the workspace is not made and the signup is
  tried again, so test a template before you ship it:

```php
config(['onboarding.template' => 'studio']);
// make a workspace as Signup does (WorkspaceProvisioned inside a transaction, as the workspace), then check what it has
```

The applied template's slug is kept in `tenant_onboarding.template` and audited as `onboarding.template.applied`.
