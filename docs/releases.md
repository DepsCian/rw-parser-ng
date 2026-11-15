# Releases

RWKit is published as `rwkit`. Release Please manages the package version, changelog, and `rwkit-vX.Y.Z` tags. Legacy tags remain available.

## Release process

Conventional Commits determine the next version: `feat` increases the minor version, `fix` and `perf` increase the patch version, and `!` marks a major change. Documentation and maintenance commits do not independently create releases.

1. Review the generated `chore: release <version>` PR and its changelog.
2. Merge the PR after required checks pass. Release Please creates the tag and GitHub release.
3. The Publish workflow verifies the tagged source, builds and checks the package, and attaches the tarball and SHA-256 checksum to the release.
4. The publishing job verifies the artifact checksum and publishes that tarball to npm with provenance.

The release App uses `RELEASE_APP_CLIENT_ID` and `RELEASE_APP_PRIVATE_KEY`. Release automation is gated by `RELEASE_AUTOMATION_ENABLED`; npm publication is gated by `NPM_PUBLISH_ENABLED`.

The npm trusted publisher is bound to `DepsCian/RWKit`, workflow `publish.yml`, and environment `npm`. The environment permits tags matching `rwkit-v*`. Publishing uses GitHub Actions OIDC.

## Failed publications

Inspect the failed job and registry version before retrying. Rerun the workflow or dispatch it at the existing release tag:

```sh
gh workflow run publish.yml --repo DepsCian/RWKit --ref rwkit-vX.Y.Z -f tag=rwkit-vX.Y.Z
```

Replace `rwkit-vX.Y.Z` with the failed release tag. Duplicate npm versions fail. Published versions and release tags must not be overwritten or moved.

Master requires `build` and `Validate PR title`, resolved conversations, and a linear history. These rules also apply to administrators and the release App. Squash commits use the PR title and an empty body.
