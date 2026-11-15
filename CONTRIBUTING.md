# Contributing

Use Bun 1.4.4, as pinned in package.json. Fork the repository and open a branch against master.

```sh
bun install --frozen-lockfile
bun run lint
bun run build
bun test
bun run check:package
```

The package smoke check also requires Node.js 24 and npm. It installs a local tarball in a temporary directory and checks its public entry points and shipped notices.

Use a Conventional Commit PR title: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, or `chore`, with an optional scope. Mark breaking changes with `!`, for example `feat!: change the parser result`. The squash commit uses the PR title with an empty body. Prefer fewer than 72 characters and never exceed 100.

Explain the problem, resulting behavior, compatibility impact, and verification. Link the relevant issue using `Fixes #<number>`. Keep changes focused and preserve attribution. Do not add unit tests unless requested; run the existing suite and targeted runtime checks.

Master requires passing checks and resolved conversations. Release PRs are maintained by automation and merged manually. See docs/releases.md for release operation.
