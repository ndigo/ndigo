# AD-108: the consumer lint surface (preset, scaffold wiring, de-hardcoded rules, rule conventions)

**Date:** 2026-11-18
**Status:** Implemented (2026-11-18).

**Related:** AD-86 (superseded in part — D4 and the #117 amendment),
AD-04 (browser boundary).

## Context

AD-86 split the lint rules between the consumer plugin and the internal plugin,
and deferred the consumer artifact. Issue #116 was the follow-up. Two rules
(`no-raw-console`, `no-browser-globals-in-isomorphic`) had been pulled back
into the internal plugin because they keyed off this monorepo's
`packages/ndigo-*` layout, so they were inert or wrong for app repos. The
consumer plugin shipped six rules with no preset, no documentation, and no
naming convention beyond ad hoc keys; no app in the repo had a `lint` script.

## Decision

### D1 — Preset is a module, not plugin metadata

`@oxlint/plugins`' `Plugin` has no `configs` key, and JSON `extends` only
resolves relative paths. So `@ndigo/oxlint-plugin/recommended` exports a typed
`OxlintConfig` from the `./recommended` subpath. JSON-config projects get it
rendered into `.oxlintrc.json` by `ndigo new` / `ndigo lint init`, with a
parity test guarding drift.

### D2 — De-hardcode by configuration, not by path options

Both ported rules keep only semantic options; scoping moves to oxlint
`overrides`:

- `no-raw-console` → `no-raw-console` (`{ methods? }`, default `log`/`warn`/`error`)
- `no-browser-globals-in-isomorphic` → `no-browser-globals` (`{ extraGlobals? }`, 14 defaults)

`getCurrentPackageName`, `packageSource`, `packageOf`, `BROWSER_ONLY_PACKAGES`,
and `ALLOWED_PACKAGES` are deleted. The root config reproduces the old scoping
with `overrides` (package source, log/util exemption, browser-only package
exemption, specs/apps).

### D3 — `recommended` is quiet by default

`recommended` enables the six platform-neutral rules. Both ported rules are
opt-in (`meta.docs.recommended: false`): a pure browser app should not see
`no-browser-globals`, and `no-raw-console` is framework policy. The node
template adds `no-browser-globals` explicitly.

### D4 — One naming scheme

Keys follow `no-*` / `require-*` / `valid-*`. Renamed:
`no-cross-paradigm-decorators` → `no-mixed-decorator-paradigms`,
`no-string-registry-lookup` → `no-string-token-lookup`,
`no-duplicate-mapping-path` → `no-duplicate-mapping`,
`internal/requires-doc-header` → `internal/require-doc-header`,
`internal/tsdoc-syntax` → `internal/valid-tsdoc`.

### D5 — Diagnostic contract

`meta.docs.url = https://ndigo.dev/lint/<key>`; every message ends with the
URL (oxlint's formatter does not print `docs.url`); `messageId` + `data`;
no `fixable`/`suggestions` this issue. `src/_docs.ts` holds `RULE_DOCS_BASE`
and `ruleUrl()`. The URL host is a release gate, not a merge gate.

### D6 — Docs pages

`docs/lint/README.md` + one page per rule with frontmatter (`rule`,
`severity`, `recommended`, `since`) and five sections.

### D7 — Conformance test

`packages/ndigo-oxlint-plugin/test/conformance.spec.ts`: naming scheme, URL,
message suffix, page parity, and `recommended` == rules marked recommended.

### D8 — Scaffold and CLI

- `create-ndigo-app` templates render `.oxlintrc.json.template`, add a `lint`
  script and `oxlint` + `@ndigo/oxlint-plugin` devDeps.
- In-repo `app` generator adds the `lint` script only (a nested config would
  shadow the root one).
- All 22 apps gain `"lint": "oxlint"`.
- `ndigo lint` becomes a route map (`defaultCommand: run`) plus
  `ndigo lint init [dir] [--kind node|browser] [--force] [--json]`. `init`
  refuses on an ancestor config and writes nothing there; it renders the
  preset, adds the script and devDeps, and prints the install command.
- Version ranges live in `commands/lint/_versions.ts` with a drift test.

### D9 — Root config migration

`.oxlintrc.json`: rename rule keys; remove the two internal rules; enable the
ported rules only via `overrides` (package source, exemptions, specs/apps).

## Consequences

- `@ndigo/oxlint-plugin` ships 8 rules + a preset.
- `docs/lint/` carries 8 pages, link-checked by `scripts/check-doc-links.mjs`.
- `ndigo lint init` is the entry point for external projects; inside this
  monorepo it correctly refuses.
- The `ndigo.dev/lint/*` route is a release gate; tracked in this ADR.

## Alternatives considered

- Shipping `recommended.json` and `extends: ["./node_modules/.../recommended.json"]`
  (rejected: relative to the config file, breaks under hoisting).
- Path options inside the rules (rejected: config-driven scoping is portable).
- Publishing the internal plugin (rejected: repo-only tooling stays out of `packages/`).

## Revisit triggers

- oxlint drops TS jsPlugin execution (internal rules would need compiling).
- A consumer needs rule sources shared with the repo (`lint-core` + adapter).
- The `ndigo.dev/lint/*` host decision changes (one constant + message text).
