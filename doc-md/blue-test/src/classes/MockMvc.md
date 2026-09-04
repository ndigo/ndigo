[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / MockMvc

# Class: MockMvc

Defined in: packages/blue-test/src/mock-mvc.ts:161

A socket-free mock MVC client for testing Blue server-side applications.

Wraps a configured NodeDispatcher and dispatches mock requests
through it, capturing the resulting HTTP response in memory.

## Example

```ts
const boot = await bootApp([MyConfiguration]);
const mockMvc = new MockMvc(boot.dispatcher);
const res = await mockMvc.get('/todos').exec();
```

## Constructors

### Constructor

> **new MockMvc**(`arg`): `MockMvc`

Defined in: packages/blue-test/src/mock-mvc.ts:167

#### Parameters

##### arg

`NodeDispatcher` \| \{ `dispatcher`: `NodeDispatcher`; \}

#### Returns

`MockMvc`

## Accessors

### dispatcher

#### Get Signature

> **get** **dispatcher**(): `NodeDispatcher`

Defined in: packages/blue-test/src/mock-mvc.ts:174

The configured dispatcher.

##### Returns

`NodeDispatcher`

## Methods

### request()

> **request**(`req`): `Promise`\<`MockResult`\>

Defined in: packages/blue-test/src/mock-mvc.ts:188

Dispatch an arbitrary mock request.

Replicates `NodeHTTPServerAdapter`'s request→dispatch contract so the
in-process behavior matches a real HTTP hit: an unmatched route yields
`404` JSON; a dispatcher error yields `500` JSON.

#### Parameters

##### req

[`MockRequest`](../interfaces/MockRequest.md)

The request spec.

#### Returns

`Promise`\<`MockResult`\>

The mock result.

***

### get()

> **get**(`path`): [`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:216

GET request builder.

#### Parameters

##### path

`string`

The path, e.g. `/todos`.

#### Returns

[`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

***

### post()

> **post**(`path`): [`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:221

POST request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

***

### put()

> **put**(`path`): [`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:226

PUT request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

***

### delete()

> **delete**(`path`): [`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:231

DELETE request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

***

### patch()

> **patch**(`path`): [`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:236

PATCH request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

***

### query()

> **query**(`path`): [`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:241

QUERY (RFC 9889) request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMvcRequestBuilder`](MockMvcRequestBuilder.md)
