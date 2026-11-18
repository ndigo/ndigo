---
rule: '@ndigo/no-scheduled-in-browser'
severity: error
recommended: true
since: 0.0.1
---

# no-scheduled-in-browser

A file imports `@ndigo/scheduler` and also imports a browser-platform package
(`@ndigo/platform-web`, `@ndigo/view-webcomponent`).

## What it reports

`scheduledInBrowser` — reported on the browser-platform import:

```ts
import { platformWeb } from '@ndigo/platform-web';
import { scheduled } from '@ndigo/scheduler';

export class TokenRefresh {
    @scheduled('0 */5 * * * *')
    async refresh() {
        /* … */
    }
}
```

## Why

`@scheduled` installs timers and reads `process` to resolve its owner; in a
browser bundle it throws at class-definition time. The co-import is the
syntactic signal that the file ships to the client — the rule is a heuristic,
and the runtime guard plus the scheduler documentation carry the rest of the
enforcement.

Type-only imports are ignored: `import type` is erased and says nothing about
where the module runs.

## How to fix

Move the scheduled class to the Node application (or a Node package) and have
the browser call it over HTTP, a socket, or a stomp route:

```ts
// browser
await fetch('/api/tokens/refresh', { method: 'POST' });
```

```ts
// node
@requestMapping('/api/tokens')
export class TokenController {
    @postMapping('/refresh')
    refresh() {
        /* … */
    }
}
```

## Options

None.

## When to disable

Never in browser code. If a shared module legitimately mentions the scheduler
for types only, import the type with `import type` and the rule stays quiet. If
a bundler alias maps the scheduler to an empty stub, disable the rule in the
override for the affected entry point and say which alias makes it safe.
