# Guide 17 — Internationalization & Content

How content and internationalization work in Ndigo: content keys, message
formatting, locale resolution (server and client), and the formatting rule
that keeps server-rendered pages faithful on the client.

The design follows one rule: **Ndigo owns the contract, wraps the
ecosystem standard, and uses platform standard APIs directly** —

| Layer                       | What it is                                                           | Who owns it                                            |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| `MessageSource` contract    | `getMessage(key, params?, language?)` over `ContentSource`           | `@ndigo/content` (framework)                           |
| Message translation         | resources, interpolation, plurals, contexts, fallbacks, lazy loading | **i18next** (via `@ndigo/content-i18next`)             |
| Date/number/list formatting | `Intl.*` formatters, cached, explicit locale/time zone               | `@ndigo/core` wrappers (framework facade, Intl engine) |
| Locale resolution           | per-request language: header/cookie/navigator/fixed                  | `@ndigo/dispatcher` + platform packages                |

**Audience:** Node and browser application developers · **Prerequisites:** Guide 01 or guide 02 · **Reference app:** `apps/12-ndigo-petclinic`, `apps/07-ndigo-island`

## What you'll learn

- Implement or compose a message source.
- Load i18next resources and format messages.
- Negotiate the locale from the request or cookie.
- Use `t()` and formatters in templates.
- Propagate locale into islands and client components.

## 1. The pipeline

```
        ┌─ NavigatorLanguageResolver ─┐  (browser: navigator.languages)
        ├─ CookieLanguageResolver ────┤  (client: persisted user choice wins)
        ├─ AcceptHeaderLanguageResolver ┤ (server: Accept-Language header)
        └─ FixedLanguageResolver ─────┘  (fallback default)
                        │
        dispatcher render → route.attributes[LANGUAGE_ATTRIBUTE]
                        │
        ┌─ EJS helpers: t/formatDate/formatNumber/…   (server templates)
        ├─ IslandView: data-ndigo-locale → hydrate .locale
        └─ Client views: currentLocale signal (reactive, no reload)
```

## 2. The message source

Register a `MessageSource` on the application context — the context itself
becomes a `MessageSource`, so any `ApplicationContextAware` bean can format
messages:

```ts
import { I18nextMessageSource } from '@ndigo/content-i18next';
import { ApplicationBuilder } from '@ndigo/boot';

const context = await new ApplicationBuilder([/* configurations */]).run();

context.setMessageSource(
    new I18nextMessageSource({
        resources: {
            en: {
                translation: {
                    greeting: 'Hello {{name}}!',
                    items_one: 'one item',
                    items_other: '{{count}} items',
                },
            },
            fr: {
                translation: {
                    greeting: 'Bonjour {{name}} !',
                    items_one: 'un article',
                    items_other: '{{count}} articles',
                },
            },
        },
        language: 'en',
        fallbackLanguage: 'en',
    })
);
```

The contract is i18next-shaped but backend-agnostic — an ICU
(`@formatjs/intl`) backend can satisfy the same interface later:

| `MessageParams` field | i18next mapping                         | Purpose                                   |
| --------------------- | --------------------------------------- | ----------------------------------------- |
| `values`              | interpolation `{{name}}`                | named placeholders                        |
| `count`               | plural keys `items_one` / `items_other` | plural selection (via `Intl.PluralRules`) |
| `context`             | context suffix `items_male`             | variant selection                         |

Lookup falls back in order: message source → content source → parent
context → the key itself.

### Lazy loading

Pass an i18next backend for on-demand resources; `preload` ahead of time:

```ts
import HttpBackend from 'i18next-http-backend';

const messages = new I18nextMessageSource({
    backend: new HttpBackend({ loadPath: '/locales/{{lng}}/{{ns}}.json' }),
    fallbackLanguage: 'en',
});

await messages.preload(['en', 'fr']);
await messages.changeLanguage('fr');
```

## 3. Server-side: negotiating from the request

`NodeAutoConfiguration` registers an `AcceptHeaderLanguageResolver` — every
Node request negotiates its language from `Accept-Language`:

```sh
curl -H 'Accept-Language: fr, en;q=0.8' http://localhost:3200/
```

The dispatch pipeline writes the negotiated language onto the route, and
templates and islands consume it. The `ndigo-island` demo serves a fully
localized page — one request, two languages:

```text
$ curl http://localhost:3200/ | grep '<h1>'
<h1>Ndigo Island</h1>
$ curl -H 'Accept-Language: fr' http://localhost:3200/ | grep -E '<h1>|lang='
<html lang="fr">
```

## 4. Templates: `t()` and formatters

Every EJS render receives helpers bound to the request's language —
no manual locale plumbing in the controller:

```html
<h1><%= t('app.title') %></h1>
<p><%- t('app.intro') %></p>
<p><%= t('app.today', { values: { date: formatDate(today, { dateStyle: 'long', timeZone: 'UTC' }) } }) %></p>
<span><%= locale %></span>
```

| Locale helper                               | Signature                   |
| ------------------------------------------- | --------------------------- |
| `t(key, params?)`                           | message lookup + formatting |
| `formatDate(value, options?)`               | `Intl.DateTimeFormat`       |
| `formatNumber(value, options?)`             | `Intl.NumberFormat`         |
| `formatRelativeTime(value, unit, options?)` | `Intl.RelativeTimeFormat`   |
| `formatList(values, options?)`              | `Intl.ListFormat`           |
| `locale`                                    | the request language        |

### The SSR parity rule

Formatters take an **explicit language and time zone** — never ambient
server local time. A server-rendered date using the server's timezone would
not match the client's re-render, breaking island hydration.
Pin the timezone in the template (`timeZone: 'UTC'`) or pass the request's.

## 5. Islands: the locale rides along

`IslandView` writes the negotiated language onto the markup so the hydrated
component formats identically to the server:

```html
<todo-app data-ndigo-island data-ndigo-locale="fr-CA" data-ndigo-model="…"></todo-app>
```

`hydrateIslands()` assigns `.locale` on the live element **before** it
connects (same ordering as `.model`), so `connectedCallback` can format with
it:

```ts
// inside the component
connectedCallback() {
    if (this.locale) {
        this.$date.textContent = formatDate(this.locale, this.receivedAt);
    }
}
```

## 6. Client-side: reactive locale

The browser platform persists the user's choice and reacts to changes
without a reload — the parts the reference framework never had to build:

```ts
import { changeLocale, currentLocale, CookieLanguageResolver } from '@ndigo/platform-web';
import { effect } from '@ndigo/signals';

// Reactive: re-render whenever the locale changes.
effect(() => {
    void currentLocale.value;
    render();
});

// Wire the switch button — persists the cookie AND updates the signal.
button.addEventListener('click', () => changeLocale('fr'));
```

Precedence: **cookie (user choice) → navigator → default** — the
`CookieLanguageResolver` registered by `WebAutoConfiguration` reads the same
`lang` cookie the signal writes, so the next dispatcher pass agrees with the
current UI.

The `ndigo-todo-web` demo ships a working switcher (`locale-switcher-view.ts`):
EN/FR buttons, a message-source-backed label, cookie persistence, and
signal-driven re-rendering.

## 7. What you get out of the box

| Concern            | Default                                                           |
| ------------------ | ----------------------------------------------------------------- |
| Server language    | `Accept-Language` header (`NodeAutoConfiguration`)                |
| Client language    | cookie `lang` → navigator → `en-US` (`WebAutoConfiguration`)      |
| Template messages  | `t()` helpers in every EJS render                                 |
| Island locale      | `data-ndigo-locale` attribute, assigned on hydration              |
| Reactive switching | `changeLocale()` → cookie + `currentLocale` signal                |
| Formatting         | `Intl.*` via `@ndigo/core` formatters (explicit locale/time zone) |

## See also

- [Content/i18n decision](../decisions/2026-09-13_AD19_CONTENT_I18N.md)
- [Content/i18n implementation plan](../plans/2026-09-13_CONTENT_I18N.md)
- [ndigo-island demo](../../apps/07-ndigo-island/README.md) — localized SSR page
- [ndigo-todo-web demo](../../apps/03-ndigo-todo-web/README.md) — reactive locale switcher
- [`@ndigo/content-i18next`](../../packages/ndigo-content-i18next/README.md) —
  the i18next adapter
