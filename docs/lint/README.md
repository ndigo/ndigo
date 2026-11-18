# Rule reference

Every consumer-facing `@ndigo/oxlint-plugin` rule has a page here. The page URL
is baked into the rule's diagnostic and into `meta.docs.url`, so a violation is
one click from the rationale:

```text
Do not import '@ndigo/signals' in an ORM entity — entities describe persisted
columns, not reactive state. https://ndigo.dev/lint/no-signals-in-entity
```

## Using the rules

```jsonc
// .oxlintrc.json — the `recommended` preset
{
    "jsPlugins": ["@ndigo/oxlint-plugin"],
    "rules": {
        "@ndigo/no-mixed-decorator-paradigms": "error",
        "@ndigo/no-scheduled-in-browser": "error",
        "@ndigo/no-signals-in-entity": "error",
        "@ndigo/no-string-token-lookup": "error",
        "@ndigo/no-unsafe-view-name-literal": "error",
        "@ndigo/no-duplicate-mapping": "error",
    },
}
```

`ndigo new` and `ndigo lint init` write that config for you. Projects on
`oxlint.config.ts` can spread the preset instead:

```ts
import { defineConfig } from 'oxlint';
import { recommended } from '@ndigo/oxlint-plugin/recommended';

export default defineConfig({ extends: [recommended] });
```

Two rules are **opt-in** because they depend on where the code runs:
`no-raw-console` (framework logging policy) and `no-browser-globals` (shared
code that must survive server rendering). Their pages explain the scoping.

## Reading a page

Each page covers the same five things:

1. what the rule reports, per message
2. why the invariant exists, with the governing guide or decision
3. how to fix a violation
4. options
5. when disabling is legitimate — and why it usually is not

## Naming

Rule keys follow one scheme: `no-*` states a prohibition, `require-*` a
requirement, `valid-*` well-formedness. The subject of the rule is the subject
of the name.

## Index

| Rule                                                                | Recommended | Enforces                                                |
| :------------------------------------------------------------------ | :---------- | :------------------------------------------------------ |
| [`no-mixed-decorator-paradigms`](./no-mixed-decorator-paradigms.md) | yes         | One decorator paradigm per class                        |
| [`no-scheduled-in-browser`](./no-scheduled-in-browser.md)           | yes         | `@scheduled` stays on the server                        |
| [`no-signals-in-entity`](./no-signals-in-entity.md)                 | yes         | Reactivity does not leak into ORM entities              |
| [`no-string-token-lookup`](./no-string-token-lookup.md)             | yes         | Context lookups use tokens, not strings                 |
| [`no-unsafe-view-name-literal`](./no-unsafe-view-name-literal.md)   | yes         | View names are relative and island tags are well-formed |
| [`no-duplicate-mapping`](./no-duplicate-mapping.md)                 | yes         | One registration per path and HTTP method in a class    |
| [`no-raw-console`](./no-raw-console.md)                             | opt-in      | Framework code logs through `@ndigo/log`                |
| [`no-browser-globals`](./no-browser-globals.md)                     | opt-in      | Shared code guards browser globals                      |
