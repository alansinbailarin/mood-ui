# Working with agents

Mood Kit is written to be changed by people and by coding agents such as Claude Code or Cursor. The way it does that is one file, `AGENTS.md`, at the root of the repository. It is read in full by the agent before it touches the code.

## What AGENTS.md is

`AGENTS.md` holds the rules the code follows: how the backend packages and frontend layers are cut, what each may depend on, how errors and API responses look, how permissions, plans, notifications and settings are extended, what the tests must cover, and the commands to run before you call something done. Each rule names the tool that enforces it (Pint, Deptrac, Larastan, Rector, Pest, ESLint, Vitest, Playwright). A few are marked as conventions: nothing fails when you break one, so the agent has to check them against its own diff.

The full text is on this site: [AGENTS.md](/kit/agents-md). `CLAUDE.md` in the repository points at it, so Claude Code loads it by default. Other tools read `AGENTS.md` directly or can be told to.

## The rules that matter most to an agent

- Code goes in a backend package or a frontend layer, and a package reaches another one only through its contracts. Deptrac and the architecture tests fail the build otherwise.
- Every change that adds or changes a visible behaviour, config key, env variable, command, route, error code or extension point updates its page under `docs/` in the same commit.
- When the code and `AGENTS.md` disagree, the code wins and both docs are fixed.
- The gates have to pass before anything is reported as done: `(cd backend && composer check)`, `pnpm --filter ./frontend check`, `pnpm quality` and `pnpm lint:secrets`.
- Commits follow the repository's commit convention, checked by commitlint.

## What an agent should never do

- Read, print, ask for or invent real secrets. API keys, database passwords, Stripe keys and Turnstile secrets go into the environment by a person, never through a prompt or a commit.
- Create accounts at Stripe, Cloudflare, AWS, Sentry or a DNS provider, or pay for anything.
- Run `migrate:fresh`, `db:wipe` or similar against a database that is not a throwaway one. The kit refuses them in production, but a shared staging database is not protected by that.
- Turn row-level security off, point the app at a superuser role, or relax a gate to make it pass.

## Recommended prompts

Paste one into your agent from the root of the repository. Replace what is in angle brackets. Each one keeps the agent inside `AGENTS.md` and the matching docs page.

### Set up the kit locally

```text
Read AGENTS.md and docs/getting-started.md. Set up Mood Kit on this machine
following the guide: copy .env.example to .env, start the Docker services,
install dependencies, run the migrations and the seeder, then start the API,
the frontend, the queue worker and the scheduler. After the migrations run
`php artisan tenancy:verify-rls`. Do not change any value in .env that the
guide does not ask you to change. Tell me what failed and why, instead of
working around it. Finish by listing the URLs and the demo sign-in.
```

The agent can run all of it. You only need Docker, PHP, Node and pnpm installed.

### Configure production

```text
Read AGENTS.md and docs/configuration/production.md. I am deploying Mood Kit
to <host>. Make a checklist of every production setting this deployment needs,
each with the env variable or file it lives in and the docs page that explains
it. Fill in everything that is not a secret in a new file named
.env.production.example, and leave every secret empty with a comment naming
who creates it. Do not create or ask me to paste real secrets. When you finish,
list what I must do by hand: DNS, certificates, accounts, keys and payments.
```

The agent writes the checklist and the example file. You create the accounts, DNS records and keys and put the secrets in your host's environment.

### Add a module

```text
Read AGENTS.md fully, then docs/concepts/architecture.md. I want to add a
module called <name> that <what it does for the user>. Before writing code,
list the packages and extension points it will use (permissions and menu,
quotas, notifications, onboarding, data attached to clients, members or
branches) and the guide in docs/guides/ for each. Wait for my answer. Then
implement it with tests, update the docs/ pages it affects in the same
commit, and run every gate in "Before you claim done" until they pass.
```

The module recipe is not written yet (see [Module system](/kit/modules)), so the prompt makes the agent plan from the architecture page and the guides first.

### Add a language

```text
Read AGENTS.md and docs/guides/add-a-locale.md. Add the <language> locale to
Mood Kit, backend and frontend, following the guide. Every label key needs a
line in the new language. Do not machine-translate legal or billing wording:
mark those strings and list them for a person to review. Run the gates and
report anything the guide did not cover.
```

The agent can add and wire the files. A person who speaks the language should review the copy.
