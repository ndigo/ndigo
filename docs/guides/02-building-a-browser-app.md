# Guide 02 — Building a Browser App

Browser apps run the same DI container as server apps — the same
`@configuration` classes, `@entry` beans, `@routeMapping` controllers,
`@parameters` binding, and view resolution — with a browser runtime in
place of the HTTP server: hash routing, in-page dispatch, and
web-component rendering. The `createWebApplication` preset
(`@ndigo/platform-web`, ) wires that runtime in one call.

Reference applications: [`[apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)`](../../[apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)/README.md)
(views and resolver chains) and [`[apps/19-ndigo-hn](https://github.com/ndigo/ndigo/tree/main/apps/19-ndigo-hn)`](../../[apps/19-ndigo-hn](https://github.com/ndigo/ndigo/tree/main/apps/19-ndigo-hn)/README.md)
(routing, services, offline cache, deep links).

**Audience:** Browser application developers · **Prerequisites:** Workspace bootstrapped; [guide 01](01-building-a-node-api.md) concepts recommended · **Reference app:** `[apps/08-ndigo-views](https://github.com/ndigo/ndigo/tree/main/apps/08-ndigo-views)`, `[apps/19-ndigo-hn](https://github.com/ndigo/ndigo/tree/main/apps/19-ndigo-hn)`

## What you'll learn

- Bootstrap a browser app with `createWebApplication`.
- Wire hash routing, in-page dispatch, and DOM view targets.
- Register app-specific tokens, services, and router interceptors.
- Test the app through the `bootBrowserApp` harness.

## 1. Bootstrap: `createWebApplication`

```ts
import { createWebApplication } from '@ndigo/platform-web';
import { AppConfiguration } from './app-configuration';
import './app-view'; // side effect: registers the `app-view` custom element

const app = await createWebApplication([AppConfiguration]);
// app.context    — the refreshed DI container (every bean stays reachable)
// app.dispatcher — the BrowserDispatcher, strategies initialized
// app.router     — the HashRouter driving navigation
// app.viewTarget — the DOM view target routes render into
// app.destroy()  — tears down the router, view target, and context
```

The preset composes, it does not replace:

- registers `WebAutoConfiguration` plus your sources (`platform: false`
 leaves the platform out);
- builds the environment from `BrowserEnvironment` — `VITE_`-prefixed
 `import.meta.env` keys arrive as the `importMetaEnv` source — and
 applies `profiles` / `properties`;
- resolves `root` (an element or an element id, default `#app`) and
 creates the `DOMElementViewTarget` (`eventMap` bridges DOM events to
 context events);
- creates the `BrowserDispatcher` (strategies initialized from the
 context) and the `HashRouter` that dispatches routes to it, and
 registers them under `VIEW_TARGET` / `DISPATCHER` / `ROUTER`;
- installs the `interceptors` you pass on the router;
- runs `beforeNavigate(app)`, then performs the first navigation:
 `initialPath` defaults to the path the URL already addresses, so a
 reload of `#/item/123` restores that route (`autoNavigate: false`
 skips it and navigation becomes yours to drive).

The manual path stays fully supported — it is what the preset replaced:

```ts
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { BrowserDispatcher, HashRouter, WebAutoConfiguration } from '@ndigo/platform-web';
import { DOMElementViewTarget } from '@ndigo/view-webcomponent';

const context = new MetadataConfigApplicationContext('my-app');
context.register(WebAutoConfiguration);
context.register(AppConfiguration);
context.refresh();
// then create the view target, dispatcher, and router by hand
```

## 2. Configuration and routes

Browser `@configuration` classes and `@routeMapping` controllers are the
same as on Node (guide 01); the handler mapping, argument resolvers, and
view-resolver chain come from `WebAutoConfiguration`.

```ts
@configuration
export class AppConfiguration {
    @entry()
    appController() {
        return new AppController();
    }
}
```

Views are web components: `@TagMapping('app-view')` registers the
element, and the resolver chain maps a view name (the tag name) to it, so
a controller can return `new ModelAndView('app-view', model)`.

Route interceptors (`RouterInterceptor`: `preHandle` / `postHandle` /
`afterCompletion` — the same contract as server-side router
interceptors) ride the `interceptors` option; late registration goes
through `app.router.addInterceptor(...)`.

## 3. App-specific state and services

Beans are plain entries; cross-bean reads go through `ContextToken`s so a
rename cannot silently miss (`[apps/19-ndigo-hn](https://github.com/ndigo/ndigo/tree/main/apps/19-ndigo-hn)/src/app/hn-tokens.ts`):

```ts
export const APP_SERVICE = new ContextToken<AppService>('appService');

@configuration
export class AppConfiguration {
    readonly #service = new AppService();

    @entry(APP_SERVICE)
    appService() {
        return this.#service;
    }
}
```

The preset's hooks cover the edges: `beforeNavigate` runs once the
runtime is wired (tokens set) and before the first dispatch — the place
for post-boot setup; `autoNavigate: false` plus `app.router.navigate(path)`
gives programmatic navigation; `app.destroy` is the teardown (it is
idempotent, and the router stops listening immediately).

## 4. Testing

The `@ndigo/test` harness boots a browser app without a DOM root
(`MemoryViewTarget`) and drives dispatches through `BrowserMockClient` —
the preset deliberately stays out of it, because production composition
and the test double are different jobs:

```ts
import { bootBrowserApp, BrowserMockClient, installSynchronousAnimationFrames } from '@ndigo/test';
import { AppConfiguration } from '../src/app-configuration';

installSynchronousAnimationFrames(); // rAF never fires in jsdom
const app = await bootBrowserApp([AppConfiguration]);
const browser = new BrowserMockClient(app);
const render = await browser.dispatch('/');
```

Every generated browser app also ships a bundle guard (`test/bundle.spec.ts`)
that parses the built entry and rejects raw TC39 decorators — run it via
the app's `test` script (`vite build && vitest run`).

## See also

- [01 — Building a Node API](01-building-a-node-api.md) — the server twin
 of this guide, including the deployment topology notes.
- [27 — Browser Authentication & OIDC](27-browser-authentication-and-oidc.md) —
 client auth and the OIDC flow.
- [29 — Signals & Islands](29-signals-and-islands.md) — reactive state and
 island hydration.
- [31 — Micro Frontends with `@ndigo/host`](31-micro-frontends.md) — composing
 feature contexts.
- [91 — Application Conventions](91-application-conventions.md) — file layout
 and naming for the `apps/NN-ndigo-<slug>` ladder.
- [`@ndigo/platform-web`](../../packages/ndigo-platform-web/README.md) — the full
 browser platform surface.
