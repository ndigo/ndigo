[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [cookies](../README.md) / CookieJar

# Interface: CookieJar

Minimal cookie-jar API exposed by the platform-web package.

## Methods

### get()

> **get**(`key`): `JSONValue` \| `undefined`

#### Parameters

##### key

`string`

#### Returns

`JSONValue` \| `undefined`

***

### getJSON()

> **getJSON**(`key`): `JSONValue` \| `undefined`

#### Parameters

##### key

`string`

#### Returns

`JSONValue` \| `undefined`

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

> **run**(`input`): [`CookieParseResult`](../type-aliases/CookieParseResult.md)

#### Parameters

##### input

`string`

#### Returns

[`CookieParseResult`](../type-aliases/CookieParseResult.md)

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
