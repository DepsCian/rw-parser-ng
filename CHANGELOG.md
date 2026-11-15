# Changelog

## [1.1.0](https://github.com/DepsCian/RWKit/compare/rwkit-v1.0.0...rwkit-v1.1.0) (2026-11-15)


### Features

* **core:** expose zero-copy byte views ([5dfbc38](https://github.com/DepsCian/RWKit/commit/5dfbc387af9d4ee7a737eca221f7012828e44adc))
* **txd:** separate texture structure from pixel decoding ([ec57957](https://github.com/DepsCian/RWKit/commit/ec5795784791795973f4d510cadb884452d4195f))


### Bug Fixes

* **codecs:** clip partial DXT blocks to texture bounds ([40a5da8](https://github.com/DepsCian/RWKit/commit/40a5da898eb052b41a12cc84cf90baa948048a4b))

## 1.0.0 (2026-11-15)


### Features

* launch RWKit with automated release management ([8dd4a25](https://github.com/DepsCian/RWKit/commit/8dd4a257220811d3291621ffdba5d768e29b9293))


### Bug Fixes

* **core:** reject invalid binary reads without moving the cursor ([#8](https://github.com/DepsCian/RWKit/issues/8)) ([88f69df](https://github.com/DepsCian/RWKit/commit/88f69dfa4fd4d0c85256f19cafeb0829b30d614a))
* **fxp:** reject missing emitter blocks before parsing can hang ([#7](https://github.com/DepsCian/RWKit/issues/7)) ([88466db](https://github.com/DepsCian/RWKit/commit/88466db61edbcdd28ff5023a602a91fa6ef90923))
* **txd:** report unsupported texture formats as parse errors ([#9](https://github.com/DepsCian/RWKit/issues/9)) ([9403162](https://github.com/DepsCian/RWKit/commit/9403162a359ba1edaa6ce82e06aa4d17027b32b7))

## Changelog

Release Please maintains this file for the RWKit release series, beginning at 1.0.0. Earlier development remains available in Git history and the legacy tags. See CREDITS.md for origins and MIGRATION.md for the package transition.
