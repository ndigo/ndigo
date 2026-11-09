# @ndigo/ui-lab — Ndigo UI lab

> A browser lab for the owned design system: every registry item installed as copy-in source, no framework runtime.

The lab dogfoods the copy-in registry. The `styles/`, `src/lib/`, `src/ui/`, and
`src/components/` trees are a full install of the 41-item registry, committed
with `ui.lock.json`; the page exercises the native-first primitives, the
Zag.js behaviour elements, and all five blocks. The typed token catalog comes
from `@ndigo/ui`.

## Run

```bash
pnpm --filter @ndigo/ui-lab dev
# http://localhost:3460
```

## What it covers

- **Native-first primitives:** button, input, field, checkbox, table, alert,
  badge, card, separator, skeleton, spinner, breadcrumb, kbd, aspect-ratio,
  item, typography, pagination
- **Behaviour primitives:** dialog, menu, popover, tooltip, tabs, accordion,
  switch, slider, select, combobox, drawer, date-picker, scroll-area,
  navigation-menu, tags-input, file-upload, toast
- **Blocks:** app-shell, command, data-table, code-block, sidebar
- **Foundation:** the `theme` tokens/base layer and the `lib` element
  foundation

## Install source

The committed tree is the full registry install. From the repository root:

```bash
node packages/ndigo-cli/bin/run.js ui init apps/20-ndigo-ui-lab --registry ../../registry.json --force
node packages/ndigo-cli/bin/run.js ui add <item> --dir apps/20-ndigo-ui-lab --skipInstall --overwrite
```

`ui.lock.json` records every installed item and file hash. Reinstall or update
individual items with `ui add`; use `--skipInstall` because the lab's npm
dependencies are already declared in its `package.json`.

## Both channels

- **Ndigo CLI:** the committed install above (`ndigo ui add`).
- **shadcn CLI:** `ndigo-site` builds the same registry into
  `public/r/<item>.json` with embedded file contents. Serve that directory and
  add a direct URL:

    ```bash
    npx shadcn@latest add http://127.0.0.1:4321/r/code-block.json
    ```

    The public `@ndigo` namespace is configured in the site, but the host is not
    deployed yet; the GitHub form also needs the repository public.

## Test

```bash
pnpm --filter @ndigo/ui-lab test
```

The spec parses the real `index.html`, upgrades the installed elements,
exercises the interactive tiers, and runs axe.

## See Also

- [apps/README](../README.md) — the applications ladder
- [@ndigo/ui](../../packages/ndigo-ui/README.md) — tokens and the registry
- [ndigo ui](../../packages/ndigo-cli/README.md) — the install command family
- [Guide 30](../../docs/guides/30-component-integration.md) — UI libraries and component integration
- [UI catalogue](https://ndigo.dev/ui) — the public browse surface

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
