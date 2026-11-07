[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-view](../README.md) / EJSLocaleHelpers

# Interface: EJSLocaleHelpers

Locale-aware template locals injected by [EJSView](../classes/EJSView.md).

`t` resolves messages through the view's application context (itself a
MessageSource from `@ndigo/content`); the formatter helpers wrap `Intl` through
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

The date value to format.

##### options?

`DateTimeFormatOptions`

Optional `Intl.DateTimeFormat` overrides.

#### Returns

`string`

The localized date string.

***

### formatList()

> **formatList**(`values`, `options?`): `string`

Formats a string list in the request locale.

#### Parameters

##### values

readonly `string`[]

The list entries to join.

##### options?

`ListFormatOptions`

Optional `Intl.ListFormat` overrides.

#### Returns

`string`

The localized list string.

***

### formatNumber()

> **formatNumber**(`value`, `options?`): `string`

Formats a number in the request locale.

#### Parameters

##### value

`number`

The numeric value to format.

##### options?

`NumberFormatOptions`

Optional `Intl.NumberFormat` overrides.

#### Returns

`string`

The localized number string.

***

### formatRelativeTime()

> **formatRelativeTime**(`value`, `unit`, `options?`): `string`

Formats a relative-time delta in the request locale.

#### Parameters

##### value

`number`

The delta value (negative for the past).

##### unit

`RelativeTimeFormatUnit`

The unit the delta is expressed in.

##### options?

`RelativeTimeFormatOptions`

Optional `Intl.RelativeTimeFormat` overrides.

#### Returns

`string`

The localized relative-time string.

***

### t()

> **t**(`key`, `params?`): `Promise`\<`string`\>

Formats a message key; falls back to the key when unavailable.
Async by convention — templates call it as `await t(…)`.

#### Parameters

##### key

`string`

The message key to resolve.

##### params?

`MessageParams`

Optional interpolation parameters for the message.

#### Returns

`Promise`\<`string`\>

The localized message, or the key when no message exists.
