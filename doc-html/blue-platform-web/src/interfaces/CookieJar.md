[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / CookieJar

# Interface: CookieJar

Defined in: [packages/blue-platform-web/src/cookies.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookies.ts#lines-31)

Minimal cookie-jar API exposed by the platform-web package.

## Methods

### get()

> **get**(`key`): `JSONValue`

Defined in: [packages/blue-platform-web/src/cookies.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookies.ts#lines-32)

#### Parameters

##### key

`string`

#### Returns

`JSONValue`

***

### getJSON()

> **getJSON**(`key`): `JSONValue`

Defined in: [packages/blue-platform-web/src/cookies.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookies.ts#lines-33)

#### Parameters

##### key

`string`

#### Returns

`JSONValue`

***

### remove()

> **remove**(`key`, `attributes?`): `string`

Defined in: [packages/blue-platform-web/src/cookies.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookies.ts#lines-34)

#### Parameters

##### key

`string`

##### attributes?

[`CookieAttributes`](../type-aliases/CookieAttributes.md)

#### Returns

`string`

***

### set()

> **set**(`key`, `value`, `attributes?`): `string`

Defined in: [packages/blue-platform-web/src/cookies.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookies.ts#lines-35)

#### Parameters

##### key

`string`

##### value

`string`

##### attributes?

[`CookieAttributes`](../type-aliases/CookieAttributes.md)

#### Returns

`string`

***

### run()

> **run**(`input`): \{ `isError`: `true`; `error`: `string`; `index`: `number`; `data`: `unknown`; \} \| \{ `isError`: `false`; `result`: `JSONObject`; `index`: `number`; `data`: `unknown`; \}

Defined in: [packages/blue-platform-web/src/cookies.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-web/src/cookies.ts#lines-36)

#### Parameters

##### input

`string`

#### Returns

\{ `isError`: `true`; `error`: `string`; `index`: `number`; `data`: `unknown`; \} \| \{ `isError`: `false`; `result`: `JSONObject`; `index`: `number`; `data`: `unknown`; \}
