[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / MockMVC

# Class: MockMVC

Defined in: packages/blue-test/src/mock-mvc.ts:161

A socket-free mock MVC client for testing Blue server-side applications.

Wraps a configured NodeDispatcher and dispatches mock requests
through it, capturing the resulting HTTP response in memory.

## Example

```ts
const boot = await bootApp([MyConfiguration]);
const mockMVC = new MockMVC(boot.dispatcher);
const res = await mockMVC.get('/todos').exec();
```

## Constructors

### Constructor

> **new MockMVC**(`arg`): `MockMVC`

Defined in: packages/blue-test/src/mock-mvc.ts:167

#### Parameters

##### arg

`NodeDispatcher` \| \{ `dispatcher`: `NodeDispatcher`; \}

#### Returns

`MockMVC`

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

> **get**(`path`): [`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:216

GET request builder.

#### Parameters

##### path

`string`

The path, e.g. `/todos`.

#### Returns

[`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

***

### post()

> **post**(`path`): [`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:221

POST request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

***

### put()

> **put**(`path`): [`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:226

PUT request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

***

### delete()

> **delete**(`path`): [`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:231

DELETE request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

***

### patch()

> **patch**(`path`): [`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:236

PATCH request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

***

### query()

> **query**(`path`): [`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)

Defined in: packages/blue-test/src/mock-mvc.ts:241

QUERY (RFC 9889) request builder.

#### Parameters

##### path

`string`

#### Returns

[`MockMVCRequestBuilder`](MockMVCRequestBuilder.md)
