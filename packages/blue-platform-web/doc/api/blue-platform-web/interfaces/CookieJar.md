[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / CookieJar

# Interface: CookieJar

Minimal cookie-jar API exposed by the platform-web package.

## Methods

### get()

> **get**(`key`): `JSONValue`

#### Parameters

##### key

`string`

#### Returns

`JSONValue`

***

### getJSON()

> **getJSON**(`key`): `JSONValue`

#### Parameters

##### key

`string`

#### Returns

`JSONValue`

***

### remove()

> **remove**(`key`, `attributes?`): `string`

#### Parameters

##### key

`string`

##### attributes?

[`CookieAttributes`](../type-aliases/CookieAttributes.md)

#### Returns

`string`

***

### run()

> **run**(`input`): \{ `data`: `unknown`; `error`: `string`; `index`: `number`; `isError`: `true`; \} \| \{ `data`: `unknown`; `index`: `number`; `isError`: `false`; `result`: `JSONObject`; \}

#### Parameters

##### input

`string`

#### Returns

\{ `data`: `unknown`; `error`: `string`; `index`: `number`; `isError`: `true`; \} \| \{ `data`: `unknown`; `index`: `number`; `isError`: `false`; `result`: `JSONObject`; \}

***

### set()

> **set**(`key`, `value`, `attributes?`): `string`

#### Parameters

##### key

`string`

##### value

`string`

##### attributes?

[`CookieAttributes`](../type-aliases/CookieAttributes.md)

#### Returns

`string`
