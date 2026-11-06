[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-client](../README.md) / HTTP

# Class: HTTP

HTTP client with interceptor support and convenience verb helpers.

## Constructors

### Constructor

> **new HTTP**(`interceptors?`, `init?`, `fetch?`): `HTTP`

Create a new HTTP client instance.

This constructor is designed for dependency injection scenarios where
interceptors, settings, and fetch implementation are managed by a
container (e.g., ApplicationContext with AsHTTPStrategy).

For direct construction, prefer using the static factory method HTTP.create().

#### Parameters

##### interceptors?

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[] = `[]`

Array of HTTP interceptors to apply

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `defaults`

Initial configuration settings

##### fetch?

\{(`input`, `init?`): `Promise`\<`Response`\>; (`input`, `init?`): `Promise`\<`Response`\>; \}

Fetch implementation (defaults to globalThis.fetch)

#### Returns

`HTTP`

#### Examples

```ts
// Dependency injection pattern (AsHTTPStrategy)
class Consumer {
  getHTTP(fetch: Fetch = globalThis.fetch): HTTP {
    const { httpInterceptors, httpSettings } = this;
    return new HTTP(httpInterceptors, httpSettings, fetch);
  }
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

> **settings**: [`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The default request settings used as the base for each request.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[]

The interceptors configured for this client instance.

##### Returns

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[]

## Methods

### connect()

> **connect**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### delete()

> **delete**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### get()

> **get**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### head()

> **head**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### options()

> **options**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### patch()

> **patch**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### post()

> **post**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### put()

> **put**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### request()

> **request**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) \| `null` = `null`

#### Returns

`Promise`\<`Response`\>

***

### trace()

> **trace**(`input`, `init?`): `Promise`\<`Response`\>

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

***

### create()

> `static` **create**(`config?`): `HTTP`

Create a new HTTP client instance with optional configuration.

This is the recommended way to create HTTP clients for direct use.
For dependency injection scenarios (e.g., with ApplicationContext),
use the constructor directly.

#### Parameters

##### config?

[`HTTPConfig`](../../http-types/interfaces/HTTPConfig.md) = `{}`

Configuration options for the HTTP client
  - `baseURL` - Base URL for resolving relative URLs
  - `params` - Default query parameters to include in all requests
  - `interceptors` - Optional HTTP interceptors
  - `fetch` - Optional custom fetch implementation (defaults to globalThis.fetch)

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

the constructor for dependency injection scenarios
