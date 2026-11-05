[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-view](../README.md) / EJSLocaleHelpers

# Interface: EJSLocaleHelpers

Locale-aware template locals injected by [EJSView](../classes/EJSView.md).

`t` resolves messages through the view's application context (itself a
[@ndigo/content!MessageSource](#)); the formatter helpers wrap `Intl` through
`@ndigo/core` formatters and use the request's negotiated language.

## Properties

### locale

> **locale**: `string`

The negotiated language for the current request.

## Methods

### formatDate()

> **formatDate**(`value`, `options?`): `string`

Formats a date value in the request locale.

#### Parameters

##### value

`string` \| `number` \| `Date`

##### options?

`DateTimeFormatOptions`

#### Returns

`string`

***

### formatList()

> **formatList**(`values`, `options?`): `string`

Formats a string list in the request locale.

#### Parameters

##### values

readonly `string`[]

##### options?

`ListFormatOptions`

#### Returns

`string`

***

### formatNumber()

> **formatNumber**(`value`, `options?`): `string`

Formats a number in the request locale.

#### Parameters

##### value

`number`

##### options?

`NumberFormatOptions`

#### Returns

`string`

***

### formatRelativeTime()

> **formatRelativeTime**(`value`, `unit`, `options?`): `string`

Formats a relative-time delta in the request locale.

#### Parameters

##### value

`number`

##### unit

`RelativeTimeFormatUnit`

##### options?

`RelativeTimeFormatOptions`

#### Returns

`string`

***

### t()

> **t**(`key`, `params?`): `Promise`\<`string`\>

Formats a message key; falls back to the key when unavailable.
Async by convention — templates call it as `await t(…)`.

#### Parameters

##### key

`string`

##### params?

`MessageParams`

#### Returns

`Promise`\<`string`\>
