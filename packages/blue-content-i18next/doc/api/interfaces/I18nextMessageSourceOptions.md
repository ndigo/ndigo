[**@blue/content-i18next v0.0.1**](../README.md)

***

[@blue/content-i18next](../README.md) / I18nextMessageSourceOptions

# Interface: I18nextMessageSourceOptions

Options for constructing an [I18nextMessageSource](../classes/I18nextMessageSource.md).

## Properties

### backend?

> `optional` **backend?**: `object`

Lazy-loading backend instance (e.g. `i18next-http-backend`).

***

### defaultNS?

> `optional` **defaultNS?**: `string`

The default namespace.

***

### fallbackLanguage?

> `optional` **fallbackLanguage?**: `string` \| `string`[]

Fallback language or ordered fallback chain.

***

### language?

> `optional` **language?**: `string`

The active language when no per-call language is given.

***

### ns?

> `optional` **ns?**: `string`[]

Namespaces to load.

***

### resources?

> `optional` **resources?**: `Resource`

Static resource bundles (namespaces keyed by language) — the
synchronous path for SSR and tests.
