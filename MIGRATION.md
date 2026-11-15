# Migrating to RWKit

RWKit 1.0.0 starts a new package and version series for the library previously published as rw-parser-ng. The version reset does not remove its supported formats or parser APIs.

```sh
npm uninstall rw-parser-ng
npm install rwkit
```

For Bun, use `bun remove rw-parser-ng` followed by `bun add rwkit`.

Replace imports from `rw-parser-ng` with imports from `rwkit`. Parser classes, functions, types, and exports retain their names. RWKit 1.0.0 also includes the fixes described in issues #4, #5, and #6: missing FXP emitters throw instead of hanging, invalid binary ranges throw without moving the cursor, and unsupported texture formats throw a parse error.

Existing rw-parser-ng versions remain downloadable. They will receive a deprecation notice after the RWKit package has been verified. New releases use the `rwkit-vX.Y.Z` tag namespace; older tags remain as historical records.

The canonical repository is https://github.com/DepsCian/RWKit. Update clone remotes to that URL. The separate RWKit-2 desktop application is unchanged; the old RWKit URL redirect to that application is superseded by this repository's name.
