# @ndigo/ui-lab — Ndigo UI lab

> A browser lab for the owned design system: registry-installed tokens, blocks, and behaviour elements with no framework runtime.

The lab dogfoods the copy-in registry. The `styles/`, `src/lib/`, `src/ui/`, and
`src/components/app-shell/` trees were installed by `ndigo ui add` and are
committed with their lockfile; the page then uses the native button, the
Zag.js dialog and menu, and the app shell. The typed token catalog comes from
`@ndigo/ui`.

## Run

```bash
pnpm --filter @ndigo/ui-lab dev
# http://localhost:3460
```

## Install source

From the repository root:

```bash
node packages/ndigo-cli/bin/run.js ui init apps/20-ndigo-ui-lab --registry ../../registry.json
node packages/ndigo-cli/bin/run.js ui add dialog menu app-shell --dir apps/20-ndigo-ui-lab --skipInstall
```

The six installed items (`theme`, `lib`, `dialog`, `menu`, `button`,
`app-shell`) and their file hashes are recorded in `ui.lock.json`.

## Both channels

- **Ndigo CLI:** the committed install above (`ndigo ui add`).
- **shadcn CLI:** the item is shadcn-compatible and was verified in a fresh app
  against a locally served item JSON. The public
  `npx shadcn@latest add ndigo/ndigo/button` form requires the repository or
  the `ndigo.dev/r/` channel to be public; neither is live yet.

## Test

```bash
pnpm --filter @ndigo/ui-lab test
```

The spec parses the real `index.html`, upgrades the installed elements, exercises
the dialog and menu keyboard paths, and runs axe.

## See Also

- [apps/README](../README.md) — the applications ladder
- [@ndigo/ui](../../packages/ndigo-ui/README.md) — tokens and the registry
- [ndigo ui](../../packages/ndigo-cli/README.md) — the install command family

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
