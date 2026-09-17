# Blue Content i18next Adapter

`@blue/content-i18next` implements the `@blue/content` `MessageSource`
contract over [i18next](https://www.i18next.com/).

i18next owns resource storage, interpolation, plurals (via
`Intl.PluralRules`), contexts, fallback chains, and lazy loading; this
package maps the BlueJS contract (`getMessage(key, params?, language?)`)
onto that surface. Each instance owns its i18next instance — no global
singleton, safe for isomorphic use.

## Installation

```bash
pnpm add @blue/content-i18next
```

## Usage

```typescript
import { I18nextMessageSource } from '@blue/content-i18next';

const messages = new I18nextMessageSource({
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
});

messages.getMessage('greeting', { values: { name: 'Ada' } }); // 'Hello Ada!'
messages.getMessage('items', { count: 3 }); // '3 items'
messages.getMessage('greeting', { values: { name: 'Ada' } }, 'fr'); // 'Bonjour Ada !'
messages.getMessage('missing.key'); // 'missing.key'
```

## Lazy loading

Pass an i18next backend (e.g. `i18next-http-backend`) to load namespaces on
demand, and `preload()` languages ahead of time:

```typescript
import HttpBackend from 'i18next-http-backend';

const messages = new I18nextMessageSource({
    backend: new HttpBackend({ loadPath: '/locales/{{lng}}/{{ns}}.json' }),
    fallbackLanguage: 'en',
});

await messages.preload(['en', 'fr']);
await messages.changeLanguage('fr');
```

## API

- `getMessage(key, params?, language?)` — format a message; missing keys
  fall back to the key itself
- `changeLanguage(language)` — switch the active language
- `preload(languages)` — load resources for the given languages
- `instance` — the underlying i18next instance (escape hatch)
- `language` — the active language

`params.values` map to interpolation values, `params.count` to i18next
plural selection (`_one`/`_other` keys), `params.context` to context
suffixes (`_male` and similar).

## See Also

- [@blue/content](../blue-content/README.md) — the `MessageSource` /
  `ContentSource` contract this adapter implements
