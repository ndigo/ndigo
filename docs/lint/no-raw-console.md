---
rule: '@ndigo/no-raw-console'
severity: error
recommended: false
since: 0.0.1
---

# no-raw-console

A `console.log`, `console.warn`, or `console.error` call appears in code that
should log through `@ndigo/log`.

## What it reports

`rawConsole` — reported on the console method name:

```ts
console.log('server listening');
console.warn('retrying');
console.error(error);
```

`console.info`, `console.debug`, and `console.trace` are not in the default
set. Computed access (`console['log']`) is ignored: the rule never guesses a
method name it cannot read.

## Why

`@ndigo/log` records carry level, timestamp, module, and trace context, and the
configured transport decides where they go (console bridge, OpenTelemetry, or a
test spy). A raw console call bypasses all of it, so the record loses the
trace that makes a production incident legible.

## How to fix

```ts
import { getLogger } from '@ndigo/log';

const logger = getLogger('orders');

logger.info('server listening');
logger.warn('retrying');
logger.error('checkout failed', { error });
```

## Options

```jsonc
{
    "@ndigo/no-raw-console": ["error", { "methods": ["log", "warn", "error"] }],
}
```

`methods` replaces the default set. An empty list falls back to the default.

The rule is **layout-blind**: it does not check paths. Scope it with oxlint
`overrides` — for example, turn it on for `src/**` and off for scripts, specs,
and the logging package itself:

```jsonc
{
    "overrides": [
        { "files": ["src/**/*.ts"], "rules": { "@ndigo/no-raw-console": "error" } },
        { "files": ["**/*.spec.ts", "**/test/**"], "rules": { "@ndigo/no-raw-console": "off" } },
    ],
}
```

## When to disable

Two cases are legitimate, and both belong in a config `overrides` entry rather
than an inline suppression:

- the package **is** the console bridge (`@ndigo/log`), is a leaf that cannot
  depend on the logger (`@ndigo/util`), or is a terminal program with no logger
  at all (a scaffolding CLI such as `create-ndigo-app`);
- a spec spies on the console on purpose.

Anything else is a missing logger.
