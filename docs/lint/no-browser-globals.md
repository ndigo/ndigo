---
rule: '@ndigo/no-browser-globals'
severity: error
recommended: false
since: 0.0.1
---

# no-browser-globals

Code that also runs on the server touches a browser global — `window`,
`document`, `localStorage`, `navigator` — without a guard.

## What it reports

`browserGlobal` — reported on the identifier that resolves to the global:

```ts
export function onReady(callback: () => void) {
    window.addEventListener('load', callback); // reported
}

export const theme = localStorage.getItem('theme'); // reported
```

Three shapes stay quiet because they do not read the global:

```ts
// typeof guard, directly or in an enclosing test
if (typeof window !== 'undefined') {
    window.addEventListener('load', callback);
}

// local binding of the same name
const document = { title: '' };

// name position — a class member or object key
const names = { window: 1, history: 2 };
```

The rule is structural, not path-aware: it checks every file it is enabled
on. A parameter or variable that happens to be named `location` is a binding,
not the global, and is not reported.

## Why

A browser global is `undefined` under Node — server rendering, a crawler, or a
build-time prerender crashes on the first access. The failure is loud at
runtime and absent in the browser, which is exactly the split that makes it
expensive. A `typeof` guard makes the server path explicit, and the code that
truly needs the global moves to a browser-only package.

## How to fix

Guard the access when the code has a sensible server path:

```ts
export function onReady(callback: () => void) {
    if (typeof window === 'undefined') {
        return;
    }
    window.addEventListener('load', callback);
}
```

Otherwise move the code into a browser-only package and exempt that package in
the config (see below).

## Options

```jsonc
{
    "@ndigo/no-browser-globals": ["error", { "extraGlobals": ["matchMedia", "ResizeObserver"] }],
}
```

`extraGlobals` adds names to the built-in list (`window`, `document`,
`navigator`, `location`, `history`, `localStorage`, `sessionStorage`,
`indexedDB`, `btoa`, `atob`, `requestAnimationFrame`, `cancelAnimationFrame`,
`performance`, `screen`). It never replaces the defaults.

The default list covers the globals that exist in browsers but not under Node.
`setTimeout`, `fetch`, and `URL` are deliberately absent: Node provides them.

## When to disable

Where the rule applies is config, not code. Enable it for shared and server
code, and turn it off for browser-only packages and specs:

```jsonc
{
    "overrides": [
        { "files": ["src/**/*.ts"], "rules": { "@ndigo/no-browser-globals": "error" } },
        { "files": ["packages/ui-web/**"], "rules": { "@ndigo/no-browser-globals": "off" } },
        { "files": ["**/*.spec.ts"], "rules": { "@ndigo/no-browser-globals": "off" } },
    ],
}
```

Do not disable it inside shared code to keep a direct access — that is the
crash the rule exists to prevent.
