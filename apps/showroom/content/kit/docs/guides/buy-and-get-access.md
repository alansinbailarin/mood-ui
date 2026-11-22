# Buy the kit and get access

How to get from paying on Polar to a clone of the kit on your machine. You need a GitHub account and a few minutes.
The repository is private, so the first time you open it you must accept an invitation.

## What you get when you pay

After you pay on Polar, the confirmation page shows two things:

- **Mood Kit license key**: press **Copy** and keep the key in a password manager. You use it once, to record your
  install (see [Activate your license](../getting-started.md#activate-your-license)), and Polar keeps it for you.
- **Mood Kit source code, GitHub repository access**: a **Connect GitHub account** button.

Polar also sends an email that links back to its customer portal. The key and the repository access stay there, so you can
come back to them at any time.

## Get access to the repository

1. **Check which GitHub account is signed in.** The account signed in on github.com in this browser is the one that gets
   access. Look at your avatar at the top right of github.com. If it is not the account you want to use for the kit, sign
   out and sign in with the right one before you go on.
2. **Press Connect GitHub account.** GitHub asks you to authorize Polar. Authorize it.
3. **Accept the invitation.** Open https://github.com/mood-ui/mood-kit/invitations while signed in with the same account
   and accept it. A 404 on that page means you are signed out, or signed in with another account than the one you
   connected.
4. **Check.** Open https://github.com/mood-ui/mood-kit. The page shows "You now have view access".

## Clone the repository

Choose the folder name now, because Docker Compose names its containers and volumes after it. Two copies of the kit in
folders with the same name share them (see `COMPOSE_PROJECT_NAME` in [Ports](../configuration/environment.md#ports)).

With the GitHub CLI:

```bash
gh repo clone mood-ui/mood-kit my-app
```

Or with git:

```bash
git clone https://github.com/mood-ui/mood-kit.git my-app
```

Git asks you to sign in to GitHub the first time. Use the account that has access.

### If you use several GitHub accounts

Clone with the account that has access. With the GitHub CLI, check the active one with `gh auth status` and change it with
`gh auth switch`. Git's credential store, for example the macOS keychain, keeps the account it used last for `github.com`,
so a clone can fail with "repository not found" even after you switched. Remove the stored `github.com` entry from the
keychain (or your credential manager) and clone again, or clone with `gh repo clone`, which uses the account of
`gh auth status`. To make git always use the GitHub CLI's active account, run `gh auth setup-git` once.

## Next

Go into the folder and follow [Getting started](../getting-started.md): `bash scripts/setup.sh`, then `pnpm dev`.
