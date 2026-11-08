[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [cookies](../README.md) / CookieJar

# Interface: CookieJar

Minimal cookie-jar API exposed by the platform-web package.

## Methods

### get()

> **get**(`key`): `JSONValue` \| `undefined`

Reads a cookie value.

#### Parameters

##### key

`string`

The cookie name.

#### Returns

`JSONValue` \| `undefined`

***

### getJSON()

> **getJSON**(`key`): `JSONValue` \| `undefined`

Reads and parses a JSON cookie.

#### Parameters

##### key

`string`

The cookie name.

#### Returns

`JSONValue` \| `undefined`

***

### remove()

> **remove**(`key`, `attributes?`): `string`

Removes a cookie.

#### Parameters

##### key

`string`

The cookie name.

##### attributes?

[`CookieAttributes`](../type-aliases/CookieAttributes.md)

Optional attributes.

#### Returns

`string`

***

### run()

> **run**(`input`): [`CookieParseResult`](../type-aliases/CookieParseResult.md)

Parses a cookie header string.

#### Parameters

##### input

`string`

The raw header.

#### Returns

[`CookieParseResult`](../type-aliases/CookieParseResult.md)

***

### set()

> **set**(`key`, `value`, `attributes?`): `string`

Writes a cookie.

#### Parameters

##### key

`string`

The cookie name.

##### value

`string`

The value.

##### attributes?

[`CookieAttributes`](../type-aliases/CookieAttributes.md)

Optional attributes.

#### Returns

`string`
