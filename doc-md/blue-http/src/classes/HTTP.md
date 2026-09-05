[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTP

# Class: HTTP

Defined in: [packages/blue-http/src/http.ts:821](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-821)

HTTP client with interceptor support and convenience verb helpers.

## Constructors

### Constructor

> **new HTTP**(`interceptors?`, `init?`, `fetch?`): `HTTP`

Defined in: [packages/blue-http/src/http.ts:917](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-917)

Create a new HTTP client instance.

This constructor is designed for dependency injection scenarios where
interceptors, settings, and fetch implementation are managed by a
container (e.g., ApplicationContext with AsHTTPStrategy).

For direct construction, prefer using the static factory method HTTP.create().

#### Parameters

##### interceptors?

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[] = `[]`

Array of HTTP interceptors to apply

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `defaults`

Initial configuration settings

##### fetch?

\{(`input`, `init?`): `Promise`\<`Response`\>; (`input`, `init?`): `Promise`\<`Response`\>; \}

Fetch implementation (defaults to globalThis.fetch)

#### Returns

`HTTP`

#### Examples

```ts
// Dependency injection pattern (AsHTTPStrategy)
getHTTP(fetch: Fetch = globalThis.fetch): HTTP {
    const { httpInterceptors, httpSettings } = this;
    return new HTTP(httpInterceptors, httpSettings, fetch);
}
```

```ts
// Direct construction (when DI is not used)
const http = new HTTP(
    [new TimeoutInterceptor(5000)],
    { baseURL: 'https://api.example.com/' }
);
```

#### See

[HTTP.create](#create) for a cleaner API when not using DI

## Properties

### settings

> **settings**: [`HTTPInit`](../type-aliases/HTTPInit.md)

Defined in: [packages/blue-http/src/http.ts:828](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-828)

The default request settings used as the base for each request.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-http/src/http.ts:830](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-830)

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Defined in: [packages/blue-http/src/http.ts:837](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-837)

The interceptors configured for this client instance.

##### Returns

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

## Methods

### create()

> `static` **create**(`config?`): `HTTP`

Defined in: [packages/blue-http/src/http.ts:876](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-876)

Create a new HTTP client instance with optional configuration.

This is the recommended way to create HTTP clients for direct use.
For dependency injection scenarios (e.g., with ApplicationContext),
use the constructor directly.

#### Parameters

##### config?

[`HTTPConfig`](../interfaces/HTTPConfig.md) = `{}`

Configuration options for the HTTP client

#### Returns

`HTTP`

A configured HTTP client instance

#### Examples

```ts
// Direct construction (recommended for standalone use)
const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: { 'Authorization': 'Bearer token123' },
    params: { 'version': 'v2' }
});
```

```ts
// With interceptors
const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    interceptors: [
        new TimeoutInterceptor(5000),
        new LoggingInterceptor()
    ]
});
```

#### See

[HTTP.constructor](#constructor) for dependency injection scenarios

***

### request()

> **request**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:933](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-933)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) \| `null`

#### Returns

`Promise`\<`Response`\>

***

### connect()

> **connect**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1016](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1016)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### delete()

> **delete**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1028](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1028)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### get()

> **get**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1040](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1040)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### head()

> **head**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1052](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1052)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### options()

> **options**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1064](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1064)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### patch()

> **patch**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1076](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1076)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### post()

> **post**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1088](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1088)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### put()

> **put**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1100](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1100)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### trace()

> **trace**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:1112](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1112)

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### \_getHTTPExecutionChain()

> `protected` **\_getHTTPExecutionChain**(`http`, `url`): [`HTTPExecutionChain`](HTTPExecutionChain.md)

Defined in: [packages/blue-http/src/http.ts:1124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-1124)

#### Parameters

##### http

`HTTP` \| [`HTTPExecutionChain`](HTTPExecutionChain.md)

##### url

`string`

#### Returns

[`HTTPExecutionChain`](HTTPExecutionChain.md)
