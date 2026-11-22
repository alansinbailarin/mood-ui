# Add an action

This guide declares something a person can do through a module of your own: make a record, change one. The declaration names the
module's own Action as its handler, so the rules and the audit trail of the API are the ones the Action already has. It is a
declaration: the kit does not run it as a person, and the paid Mood Kit AI add-on reads it. The example is `tickets.create` of a `Tickets`
package. What an action is and what the registry checks is in [Data](../packages/data.md).

Only creates and edits can be declared. The registry refuses an action whose key ends in `.delete`, `.destroy`, `.erase`,
`.remove` or `.purge` with an `OperationInvalid`, so a deletion is never one a model can ask for.

## Before you start

- A backend package with an Action that makes the record, here `MoodKit\Tickets\Actions\CreateTicket`, which the controller
  already calls, and the permission `tickets.manage`.
- Its `composer.json` requires `"mood-kit/data": "@dev"`.

## 1. The handler

A handler implements `PerformsAction`. It turns the validated input into the Action's own input and calls it, as the
controller does. It does not check the permission, which is a declared field of the action and not the handler's business, and it does not write an audit
entry (the Action does):

```php
<?php

declare(strict_types=1);

namespace MoodKit\Tickets\Data;

use MoodKit\Data\Contracts\Operations\OperationResult;
use MoodKit\Data\Contracts\PerformsAction;
use MoodKit\Data\Contracts\Viewer;
use MoodKit\Tickets\Actions\CreateTicket;
use MoodKit\Tickets\Dto\NewTicket;

final readonly class CreateTicketOperation implements PerformsAction
{
    public function __construct(private CreateTicket $create) {}

    public function perform(array $input, Viewer $viewer): OperationResult
    {
        $ticket = $this->create->handle($viewer->tenantId, $viewer->userId, new NewTicket(name: (string) $input['subject']));

        return new OperationResult('tickets.tickets', $ticket->id, "/dashboard/tickets/{$ticket->id}");
    }
}
```

The input a handler receives holds only the fields you declare, already validated. An id of a record comes from a person, so the Action must
look it up the way the API does (its finder, with the workspace and branch rules): a record of another workspace or of a branch
the person does not see is a not found, never a change.

## 2. The declaration

Add `ActionProvider` to the class that declares the datasets, or make one of its own:

```php
public function operations(): array
{
    return [
        new Operation(
            key: 'tickets.create',
            labelKey: 'tickets::data.actions.create',
            permission: 'tickets.manage',
            fields: [
                Field::string('subject')->max(120)->required(),
                Field::text('body')->max(2000),
                Field::id('branchId', 'branches.branches')->nullable(),
            ],
            handler: CreateTicketOperation::class,
            summary: static fn (array $input, Viewer $viewer): string => __('tickets::data.actions.create_summary', ['subject' => $input['subject'] ?? '']),
            flag: 'tickets.enabled',
            duringImpersonation: true,
        ),
    ];
}
```

- A `Field` gives both the Laravel rules and the JSON Schema of the input. `->required()`, `->max()`, `->nullable()` and
  `->also(new PlainName)` (a rule of your own, the same your API request uses) say the rest.
- `summary` is one line, translated for the request's language, that says what the action will do. It gets the viewer too: read
  anything it names (a record's name) as that person, never as the request's. The closure is private to the declaration: `Operation`
  has no public way to call it other than an `@internal` accessor, and what it reads is only for someone who may run the action.
- `flag` and `feature` gate it as they gate the routes. Name them: an action without them is open to the permission alone.
- `duringImpersonation` says whether a super admin acting as the person may run it. It is `false` unless you say so: say `true` only
  when the action's HTTP route carries `impersonation-allowed` (a create or an edit of your module's own data), and leave it
  `false` for money, the account and anything the person keeps. `OperationImpersonationTest` compares the action `<package>.create`
  with the route `<package>.store`, and `<package>.update` with `<package>.update`.
- A field that holds a password or a secret (`password`, `password_confirmation`, `current_password`, or `->secret()`) is not
  trimmed, as the framework does not trim a password.
- The check that refuses a key with a word like `delete` or `purge` looks at the name only. An action called `cancel`, `revoke` or
  `archive` passes it, so what the handler's Action does is the module author's responsibility.

Tag the class in the service provider, in both tags if it declares datasets too:

```php
$this->app->tag([TicketsData::class], ['data.datasets', 'data.actions']);
```

## 3. Test it

A test of an action checks its declaration: the registry has the key, behind the permission and the flag you meant, the schema is the
closed object you meant (the required fields, no field the API does not take), the handler is a `PerformsAction` the container can
make, `duringImpersonation` is what the route says, and both languages have its label:

```php
$operation = resolve(OperationCatalog::class)->find('tickets.create');

expect($operation->permission)->toBe('tickets.manage')
    ->and($operation->schema()['required'])->toBe(['subject'])
    ->and($operation->schema()['additionalProperties'])->toBeFalse()
    ->and(resolve($operation->handler))->toBeInstanceOf(PerformsAction::class);
```

`ProjectsOperationsTest` is the model, and `kit:make-module` writes the same test for a module it makes. The Action the handler calls
has its own tests, as the API's controller does: the rules of a branch, a record of another workspace and the audit entry are tested
there, once.
