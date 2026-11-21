# Add a block to the public page

A block is one section of a business's public page: a class in the backend and a component in the frontend. The owner sees a form
built from the block's fields, with a tab for each language, and a preview of the page. This guide adds a block of your own with
one command, then changes what it generates. The example is `Testimonials`: what the clients of the business say. How the page
works is in [PublicPage](../packages/public-page.md).

A block starts off. It is in the admin's catalog (`/platform/public-page`) but no workspace can use it until an admin turns it on.

## Before you start

- You have a backend package of your own, here `backend/packages/Showcase` with the namespace `MoodKit\Showcase\` and a
  `ShowcaseServiceProvider`. To create one, follow "Packages" in `AGENTS.md`.
- Its `composer.json` requires `"mood-kit/public-page": "@dev"`. Your package reaches PublicPage only through
  `MoodKit\PublicPage\Contracts\*`.
- Its provider loads the package's words, in its `boot()`: `$this->loadTranslationsFrom(__DIR__.'/../lang', 'showcase');`. The
  namespace you give there (`showcase`) is the one the block's keys start with.

If one of these is missing, the command says what to add and writes nothing.

## 1. Generate it

From `backend/`:

```bash
php artisan kit:make-block Testimonials --package=Showcase
```

The name is in StudlyCase (`Testimonials`, `PriceList`), from 2 to 40 characters. Its type is the snake case of the name
(`testimonials`, `price_list`). The command writes:

| File | What it is |
|---|---|
| `backend/packages/Showcase/src/PublicPage/TestimonialsBlock.php` | The block's class |
| `backend/packages/Showcase/lang/en/block_testimonials.php` and `lang/es/block_testimonials.php` | Its name, description, labels and help |
| `backend/packages/Showcase/tests/Feature/TestimonialsBlockTest.php` | Its Pest test |
| `backend/packages/Showcase/src/ShowcaseServiceProvider.php` (changed) | One line that tags the block, and its `use` |
| `frontend/layers/public-page/app/components/blocks/PublicBlockTestimonials.vue` | Its component |
| `frontend/layers/public-page/tests/blocks/publicBlockTestimonials.test.ts` | Its Vitest test |

It never overwrites a file, and it checks everything before it writes anything. It refuses, with a message that says what to do
and with nothing written, when:

- it runs in production;
- the name is not StudlyCase, or the frontend would read its type back as another;
- the name is one PHP reserves (`Class`, `Array`, `Match`...) or the block reads from its own scope (`This`, `Data`, `Context`);
- `--package` is missing (the message lists the packages that can take a block), or the package does not exist, is
  `PublicPage`, does not require `mood-kit/public-page`, has no provider or loads no words;
- a block with that type is registered already, or any of the files exists;
- it cannot find `frontend/layers/public-page`;
- it does not know where to put the tag in your provider. Then it prints the line, and you add it yourself.

Do not write these files by hand: what the command writes passes every gate of the repository, and a block written from scratch
usually misses a piece.

What it writes is an example of a title and a list of entries. The next steps change it into your block.

## 2. Its fields and rules

`fields()` is what the owner fills in, and what the editor builds its form from. Each field comes from a constructor of
`MoodKit\PublicPage\Contracts\Field`:

| Constructor | Keeps |
|---|---|
| `Field::text($name, $labelKey, max: 120, required: false, helpKey: ...)` | A text, by language |
| `Field::richText(...)` | A formatted text (bold, italics, lists, links), by language |
| `Field::media($name, $labelKey)` | One image of the workspace |
| `Field::mediaList($name, $labelKey, min: 2, max: 12)` | Several images, each with its alt text |
| `Field::url($name, $labelKey)` | A link the page allows (https, mailto, tel) |
| `Field::enum($name, $labelKey, ['start', 'end'], optionsKey: '...')` | One of a list; every option needs a line `<optionsKey>.<value>` in each language |
| `Field::bool($name, $labelKey)` | Yes or no |
| `Field::branchPicker($name, $labelKey, max: 10)` | Branches of the workspace |
| `Field::repeater($name, $labelKey, [...], min: 1, max: 12)` | A list of entries, each with its own fields |
| `Field::phone(...)`, `Field::email(...)` | A phone in E.164, an email |

Every text is kept by language: the owner writes it once for each language they use, and the page shows the one of the visitor,
or the business's main one when there is none. A name that is the same in every language is written once, so a text that is
`required` only needs one language.

`rules($locales)` starts from `BlockRules::of($this->fields(), $locales)`, which turns each field into its validation. To add a
rule of your own, merge it into the array it returns:

```php
public function rules(array $locales): array
{
    return [...BlockRules::of($this->fields(), $locales), 'quotes' => ['required', 'list', 'min:1', 'max:6']];
}
```

Every label and help is a translation key (`showcase::block_testimonials.fields.title`), written in step 5.

## 3. What it hands its component

`resolve($data, $context)` receives what the owner saved and answers what the component draws. Keep it small:

- Answer only what the component draws, in the shape it reads. The component is the only reader.
- Never trust that a saved id is still there: a branch or an image can be gone. Skip what is missing.
- Read other packages' data only through their `Contracts\`, and images only through `$context->media->image($id)`.
- While `$context->sample` is true (the catalog's thumbnail and the editor's "Add a block"), there is no workspace: answer
  examples of your own and read nothing. `BlockContractTest` runs `resolve()` on the sample with no workspace and fails on any
  query.

## 4. Its sample

`sample()` is data of example that passes the block's own rules, as if the owner had written it. The catalog and the editor draw
it as the block's thumbnail. Write it in English at least (the thumbnail falls back to English) and in Spanish, and make it up:
never real people or businesses.

## 5. Its words

Every name, description, label, help and enum option is a key of `lang/en/block_<type>.php`, with the same key in
`lang/es/block_<type>.php`. A key missing in one language, a blank line or an en or em dash (a hyphen in a compound word is fine) fails the tests, each
with a message that names the key and the language.

## 6. Its component

The frontend finds a block's component by its file name, `PublicBlock<Name>.vue`, in the public-page layer
(`frontend/layers/public-page/app/components/blocks/`). That is why the component of a block of yours lives there, and not in
your package: it can use what the layer has (`textIn()`, `safeHref()`, `PublicPageHeading`, `PublicPageMarkdown`).

It gets two props: `data` (what `resolve()` answered) and `locale` (`{ current, fallback }`). The rules of the kit apply:

- mood-ui as it comes: never change its style from outside.
- Colors only from the theme's tokens. No shadows, no emojis, no dashes in any text.
- Texts of the owner go through `textIn(text, locale)`. A text of the component's own goes through `t()`, with its key in both
  languages of the layer.
- A link is `safeHref()` and, if it looks like a button, a `KitButton` with a `tooltip` of 2 to 5 words.
- Do not center the block: the page sets its width and position, so a block starts at the left edge.
- Declare the type of `data` inside the `.vue` file, as the generated component does: the dead-code check does not read what a
  `.vue` imports from another file in a layer.

## 7. Its tests

The command wrote two tests. Change them together with the fields:

- `tests/Feature/<Name>BlockTest.php` checks the names, the sample, what the rules refuse, what `resolve()` answers and that the
  sample is drawn without reading anything. Its cases follow the fields: update the data they use.
- `tests/blocks/publicBlock<Name>.test.ts` mounts the component with a sample and checks that it draws it in each language and
  starts at the left edge.

## 8. Check it

From `backend/`:

```bash
./vendor/bin/pest packages/Showcase packages/PublicPage/tests/Feature/BlockContractTest.php
```

From `frontend/`:

```bash
pnpm exec vitest run layers/public-page
```

`BlockContractTest` looks at every installed block and says, in a sentence for each piece, what is missing. For example:

```text
The block [testimonials] has no component: write frontend/layers/public-page/app/components/blocks/PublicBlockTestimonials.vue,
which draws what its resolve() answers (php artisan kit:make-block writes one; docs/guides/add-a-public-page-block.md).

The block [testimonials] has no [es] words for [showcase::block_testimonials.fields.role]: write them in the lang/es file that
key names, in the package that declares MoodKit\Showcase\PublicPage\TestimonialsBlock.
```

It also crosses the registered types with the components in both ways, so a component no block registers is named too.

Then the four gates of the repository, one after the other, from the root: `(cd backend && composer check)`,
`pnpm --filter ./frontend check`, `pnpm quality` and `pnpm lint:secrets`.

## 9. Turn it on

An admin opens `/platform/public-page`, finds the block in the catalog with its thumbnail and turns it on. From then on it
shows in "Add a block" in each workspace's editor. If you sell it only in some plans, ask for a feature of the plans there too.

## A complete example: testimonials

These are the five files of the block, as they pass the gates. The sixth is the tag in the provider, which the command adds.

`backend/packages/Showcase/src/PublicPage/TestimonialsBlock.php`

```php
<?php

declare(strict_types=1);

namespace MoodKit\Showcase\PublicPage;

use MoodKit\PublicPage\Contracts\BlockContext;
use MoodKit\PublicPage\Contracts\BlockRules;
use MoodKit\PublicPage\Contracts\Field;
use MoodKit\PublicPage\Contracts\PublicPageBlock;

/**
 * Testimonials: what the clients of the business say. An optional title and from 1 to 12 quotes, each with its author and, if the
 * owner wants it, the author's role. Every text is kept by language; the component picks one. It reads nothing live, so its
 * resolve() answers what was kept and its sample is the same in the catalog and in the editor.
 */
final readonly class TestimonialsBlock implements PublicPageBlock
{
    public function type(): string
    {
        return 'testimonials';
    }

    public function nameKey(): string
    {
        return 'showcase::block_testimonials.name';
    }

    public function descriptionKey(): string
    {
        return 'showcase::block_testimonials.description';
    }

    public function fields(): array
    {
        return [
            Field::text('title', 'showcase::block_testimonials.fields.title', max: 120, helpKey: 'showcase::block_testimonials.help.title'),
            Field::repeater('quotes', 'showcase::block_testimonials.fields.quotes', [
                Field::text('quote', 'showcase::block_testimonials.fields.quote', max: 300, required: true),
                Field::text('author', 'showcase::block_testimonials.fields.author', max: 80, required: true, helpKey: 'showcase::block_testimonials.help.author'),
                Field::text('role', 'showcase::block_testimonials.fields.role', max: 80),
            ], min: 1, max: 12, helpKey: 'showcase::block_testimonials.help.quotes'),
        ];
    }

    public function rules(array $locales): array
    {
        return BlockRules::of($this->fields(), $locales);
    }

    public function resolve(array $data, BlockContext $context): array
    {
        $quotes = array_values((array) ($data['quotes'] ?? []));

        return ['title' => $data['title'] ?? null, 'quotes' => $quotes];
    }

    public function sample(): array
    {
        return [
            'title' => ['en' => 'What our clients say', 'es' => 'Lo que dicen nuestros clientes'],
            'quotes' => [
                [
                    'quote' => ['en' => 'They fixed it in one visit and left everything clean.', 'es' => 'Lo arreglaron en una sola visita y todo quedó limpio.'],
                    'author' => ['en' => 'Marta Ruiz'],
                    'role' => ['en' => 'Regular client', 'es' => 'Cliente frecuente'],
                ],
                [
                    'quote' => ['en' => 'Easy to book, and they were on time.', 'es' => 'Fácil de reservar, y llegaron a tiempo.'],
                    'author' => ['en' => 'Daniel Ortega'],
                ],
            ],
        ];
    }
}
```

`backend/packages/Showcase/lang/en/block_testimonials.php`

```php
<?php

declare(strict_types=1);

// The words of the Testimonials block of the public page: its name and description in the editor and the admin's catalog, and each
// field's label and help. Every key in English and in Spanish, and no dash of a sentence.
return [
    'name' => 'Testimonials',
    'description' => 'What the clients of the business say: a quote with its author, in a grid.',
    'fields' => [
        'title' => 'Title',
        'quotes' => 'Quotes',
        'quote' => 'Quote',
        'author' => 'Author',
        'role' => 'Role',
    ],
    'help' => [
        'title' => 'Optional. It goes above the quotes.',
        'quotes' => 'From 1 to 12.',
        'author' => 'A name is the same in every language: one is enough.',
    ],
];
```

`backend/packages/Showcase/lang/es/block_testimonials.php`

```php
<?php

declare(strict_types=1);

// Las palabras del bloque Testimonials de la página pública: su nombre y su descripción en el editor y en el catálogo del admin,
// y la etiqueta y la ayuda de cada campo. Cada llave en inglés y en español, y sin rayas.
return [
    'name' => 'Testimonios',
    'description' => 'Lo que dicen los clientes del negocio: una cita con su autor, en una cuadrícula.',
    'fields' => [
        'title' => 'Título',
        'quotes' => 'Citas',
        'quote' => 'Cita',
        'author' => 'Autor',
        'role' => 'Puesto',
    ],
    'help' => [
        'title' => 'Opcional. Va arriba de las citas.',
        'quotes' => 'De 1 a 12.',
        'author' => 'Un nombre es igual en todos los idiomas: con uno basta.',
    ],
];
```

`frontend/layers/public-page/app/components/blocks/PublicBlockTestimonials.vue`

```vue
<script setup lang="ts">
import { Typography } from "mood-ui";
import type { BlockLocale, Localized } from "../../types/public-page";
import { textIn } from "../../utils/localized-text";

/**
 * Testimonials (php artisan kit:make-block): an optional title, then each quote with its author in two columns from `md` up. It
 * gets what the block's resolve() answered and the language to draw; it starts at the left edge of the page like every block,
 * with no centering margin of its own.
 */
type TestimonialsData = { title: Localized | null; quotes: Array<{ quote: Localized; author: Localized; role?: Localized | null }> };
const props = defineProps<{ data: TestimonialsData; locale: BlockLocale }>();
const title = computed(() => textIn(props.data.title, props.locale));
const entries = computed(() =>
  props.data.quotes.map((item, index) => ({
    key: `testimonials-${index}`,
    quote: textIn(item.quote, props.locale),
    author: textIn(item.author, props.locale),
    role: textIn(item.role, props.locale),
  })),
);
</script>

<template>
  <div data-testid="public-block-testimonials">
    <PublicPageHeading :title="title" />
    <div class="grid gap-8 md:grid-cols-2">
      <figure v-for="entry in entries" :key="entry.key">
        <blockquote>
          <Typography as="p" variant="body" size="large">{{ entry.quote }}</Typography>
        </blockquote>
        <figcaption class="mt-3">
          <Typography as="p" variant="body" size="small" weight="semibold">{{ entry.author }}</Typography>
          <Typography v-if="entry.role" as="p" variant="body" size="small" color="muted">{{ entry.role }}</Typography>
        </figcaption>
      </figure>
    </div>
  </div>
</template>
```

`frontend/layers/public-page/tests/blocks/publicBlockTestimonials.test.ts`

```ts
// @vitest-environment nuxt
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import PublicBlockTestimonials from "../../app/components/blocks/PublicBlockTestimonials.vue";
import { EN, ES } from "../fixtures/blocks";

// What the block's resolve() answers for its sample(), drawn. Change it with the block's fields.
const SAMPLE = {
  title: { en: "What our clients say", es: "Lo que dicen nuestros clientes" },
  quotes: [
    { quote: { en: "Easy to book.", es: "Fácil de reservar." }, author: { en: "Marta Ruiz" }, role: { en: "Regular client", es: "Cliente frecuente" } },
    { quote: { en: "On time.", es: "A tiempo." }, author: { en: "Daniel Ortega" } },
  ],
};

describe("the testimonials block", () => {
  it("titles itself and draws each quote with its author, in the language shown", async () => {
    const block = await mountSuspended(PublicBlockTestimonials, { props: { data: SAMPLE, locale: ES } });

    expect(block.get("h2").text()).toBe("Lo que dicen nuestros clientes");
    expect(block.findAll("figure")).toHaveLength(2);
    expect(block.get("blockquote").text()).toBe("Fácil de reservar.");
    expect(block.get("figcaption").text()).toContain("Marta Ruiz");
    expect(block.get("figcaption").text()).toContain("Cliente frecuente");
  });

  it("shows a text missing in the language shown in the business's main one, and no title or role it has not", async () => {
    const data = { title: null, quotes: [{ quote: { es: "Hola" }, author: { en: "Ana" } }] };
    const block = await mountSuspended(PublicBlockTestimonials, { props: { data, locale: EN } });

    expect(block.find("h2").exists()).toBe(false);
    expect(block.get("blockquote").text()).toBe("Hola");
    expect(block.findAll("figcaption p")).toHaveLength(1);
  });

  it("starts at the left edge of the page, like every block", async () => {
    const block = await mountSuspended(PublicBlockTestimonials, { props: { data: SAMPLE, locale: EN } });

    expect(block.html()).not.toContain("mx-auto");
  });
});
```

The Pest test the command wrote, updated to these fields, is
`backend/packages/Showcase/tests/Feature/TestimonialsBlockTest.php`:

```php
<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use MoodKit\PublicPage\Catalog\SampleMedia;
use MoodKit\PublicPage\Contracts\BlockContext;
use MoodKit\PublicPage\Registry\BlockRegistry;
use MoodKit\Showcase\PublicPage\TestimonialsBlock;

it('is a block of the public page, tagged by its package', function (): void {
    expect(resolve(BlockRegistry::class)->find('testimonials'))->toBeInstanceOf(TestimonialsBlock::class);
});

it('names itself and says what it is for, in English and in Spanish', function (string $locale): void {
    $block = new TestimonialsBlock;

    expect(trans($block->nameKey(), [], $locale))->not->toBe($block->nameKey())
        ->and(trans($block->descriptionKey(), [], $locale))->not->toBe($block->descriptionKey());
})->with(['en', 'es']);

it('takes its own sample', function (): void {
    $block = new TestimonialsBlock;

    expect(Validator::make($block->sample(), $block->rules(['en', 'es']))->errors()->toArray())->toBe([]);
});

it('refuses what the page must not keep', function (array $data, string $field): void {
    $block = new TestimonialsBlock;

    expect(Validator::make($data, $block->rules(['en', 'es']))->errors()->toArray())->toHaveKey($field);
})->with([
    'no quote' => [['quotes' => []], 'quotes'],
    'a quote with no author' => [['quotes' => [['quote' => ['en' => 'Hi']]]], 'quotes.0.author'],
    'a quote with no text' => [['quotes' => [['author' => ['en' => 'Ana']]]], 'quotes.0.quote'],
    'a text in a language the platform has not' => [['title' => ['fr' => 'Salut'], 'quotes' => [['quote' => ['en' => 'Hi'], 'author' => ['en' => 'Ana']]]], 'title'],
    'a quote of more than 300 characters' => [['quotes' => [['quote' => ['en' => str_repeat('a', 301)], 'author' => ['en' => 'Ana']]]], 'quotes.0.quote.en'],
    'more than 12 quotes' => [['quotes' => array_fill(0, 13, ['quote' => ['en' => 'Hi'], 'author' => ['en' => 'Ana']])], 'quotes'],
]);

it('hands its component what was kept', function (): void {
    $block = new TestimonialsBlock;
    $kept = ['title' => ['en' => 'Hi'], 'quotes' => [['quote' => ['en' => 'One'], 'author' => ['es' => 'Ana']]]];

    expect($block->resolve($kept, BlockContext::forSample(new SampleMedia)))->toBe($kept);
});

it('draws its sample with no workspace and reads nothing', function (): void {
    $block = new TestimonialsBlock;
    DB::flushQueryLog();
    DB::enableQueryLog();

    expect($block->resolve($block->sample(), BlockContext::forSample(new SampleMedia)))->toBeArray()
        ->and(DB::getQueryLog())->toBe([]);
});
```

## When you take a new version of the kit

The component and its test live in the kit's public-page layer, but they are yours. When you update the kit, keep
`components/blocks/PublicBlock<Name>.vue` and `tests/blocks/publicBlock<Name>.test.ts` of each block of yours: they are not part
of the kit, and the contract test names any that goes missing.

## A prompt for an agent

Fill in the three places between angle brackets and give this to your agent:

````text
You are adding a block to the public page of this Mood Kit app. Read AGENTS.md ("PublicPage" under Backend, and "Layers" and
"Design" under Frontend) and docs/guides/add-a-public-page-block.md before you write anything.

The block: <what it shows, to whom, and what the business's owner fills in>.
Its name: <StudlyCase>. Its package: <your package under backend/packages>.

1. From backend/, run `php artisan kit:make-block <Name> --package=<Package>`. Never write its files by hand. If it refuses,
   do what its message says and run it again.
2. In packages/<Package>/src/PublicPage/<Name>Block.php, replace the example: fields() with the Field constructors, rules()
   from BlockRules::of() plus any rule of your own, a resolve() that hands the component only what it draws (live data only
   through other packages' Contracts, and none while $context->sample is true), and a sample() its rules take, in English and
   in Spanish, made up.
3. Write every name, description, label and help in packages/<Package>/lang/en and lang/es (block_<type>.php). No blank
   line and no en or em dash in any language: the tests fail on both.
4. Draw it in frontend/layers/public-page/app/components/blocks/PublicBlock<Name>.vue: mood-ui as it comes, colors from
   tokens, textIn() for the owner's texts, safeHref() and a KitButton with a tooltip of 2 to 5 words for any link, t() for
   any text of its own (in both languages of the layer), no centering, no shadow, no emoji. Keep its data type inside the file.
5. Bring the two tests kit:make-block wrote up to date with the new fields.
6. Run `./vendor/bin/pest packages/<Package> packages/PublicPage/tests/Feature/BlockContractTest.php` and, from frontend/,
   `pnpm exec vitest run layers/public-page`. BlockContractTest names each missing piece in a sentence: do what it says.
   Then run the four gates of AGENTS.md, one after the other.
7. Never change the kit's blocks, the catalog, a threshold or an exclusion. The block starts off: end your answer by saying
   that an admin turns it on in /platform/public-page.
```
````
