# Releases

RWKit is published from master as the npm package `rwkit`. Legacy tags remain untouched. Release Please uses the `rwkit-vX.Y.Z` namespace, initial version 1.0.0, and the last published legacy commit as its bootstrap boundary. The empty initial manifest deliberately avoids inheriting the old 2.x version series.

The release App creates or updates one `chore: release <version>` PR from Conventional Commits. Features increase the minor version, fixes and performance changes increase the patch version, and `!` marks a major change. Maintenance-only commits do not independently create releases. The initial rebrand is a feature. Review and manually squash-merge the release PR; do not change its generated body or labels. The merged PR creates a tag and GitHub release.

## GitHub App setup

Create an App under the maintainer account and install it only on DepsCian/RWKit. Grant repository Contents, Issues, and Pull Requests write permissions. It needs no branch-protection bypass or webhook. Store its client ID as repository variable `RELEASE_APP_CLIENT_ID` and its private key as secret `RELEASE_APP_PRIVATE_KEY`. Never put either private keys or account tokens in tracked files or chat.

Set `RELEASE_AUTOMATION_ENABLED=true` only after those credentials are configured. Until then the release job is explicitly skipped. The App's installation token allows its PRs and releases to trigger normal workflows. Do not substitute the built-in GitHub token, which suppresses these triggers.

## First publication

Keep `NPM_PUBLISH_ENABLED=false`. After merging the 1.0.0 release PR, the Publish workflow checks out the exact tag, validates package identity, runs verification, builds the tarball, and attaches it and its SHA-256 checksum to the release. The workflow summary explicitly reports that npm publication is awaiting bootstrap.

Download the verified artifacts into an empty directory:

```sh
gh release download rwkit-v1.0.0 --repo DepsCian/RWKit --pattern 'rwkit-1.0.0.tgz*'
sha256sum --check rwkit-1.0.0.tgz.sha256
npm login
npm stage publish ./rwkit-1.0.0.tgz --access public --tag latest
npm stage list rwkit
npm stage view <stage-id>
npm stage approve <stage-id>
```

Use the real npm CLI with the maintainer's login and WebAuthn verification. New npm 2FA enrollments do not support TOTP authenticator apps. Supported authenticators include Windows Hello, Touch ID, Face ID, and physical security keys; available options depend on the device and registered credentials. Staging creates the new package without publishing it; approval performs the publishing authentication check. Wait for the staged artifact's validation to finish before approving it. Direct publication can return E403 without prompting for 2FA even when login succeeds. Complete the publishing passkey verification when prompted. Never send authentication codes or private keys in chat. No npm token is needed in GitHub. This interactive bootstrap does not claim npm provenance; later OIDC publications generate provenance. Verify `npm view rwkit@1.0.0` and install the registry package into a temporary consumer before deprecating the old package.

```sh
npm deprecate 'rw-parser-ng@*' 'Renamed to rwkit. See https://github.com/DepsCian/RWKit/blob/master/MIGRATION.md'
```

## Trusted publishing

The npm package must exist before configuring trust. Enable 2FA on the maintainer's npm account. Use npm CLI 11.15.0 or later to configure the publisher with `npm trust github rwkit --repo DepsCian/RWKit --file publish.yml --environment npm --allow-publish`. Check the installed CLI's help for interactive confirmation requirements.

Create the GitHub `npm` environment with deployment allowed only from tags matching `rwkit-v*`, without required reviewers. Configure trust just before the next ready release: a new trusted publisher must complete its first successful publication within two days or npm expires the configuration. Set `NPM_PUBLISH_ENABLED=true` when trust is ready. Allow direct publishing, not only staged publishing. After a successful OIDC publication, restrict token-based npm publishing access.

## Recovery

The publishing job downloads the same artifact that passed verification and checks its checksum before publishing. A tag must match the package version and refer to a published stable release. Rerun a failed workflow, or dispatch it at the existing tag:

```sh
gh workflow run publish.yml --repo DepsCian/RWKit --ref rwkit-v1.0.1 -f tag=rwkit-v1.0.1
```

Use the actual failed release tag. Duplicate npm versions fail visibly; never overwrite a version, delete or move a tag, or silently ignore a publishing error. If npm already contains the version, inspect the existing package and workflow history before taking any further action.

The `build` and `Validate PR title` checks are required on master. Administrators and the release App follow the same PR rules. Squash commits use the PR title and an empty body. Keep these check names stable when editing CI.
