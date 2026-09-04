[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / MockMvcRequestBuilder

# Class: MockMvcRequestBuilder

Defined in: packages/blue-test/src/mock-mvc.ts:76

Fluent builder for a single mock HTTP request.

```ts
const res = await mockMvc.get('/todos').query({ filter: 'active' }).exec();
expect(res.json()).toEqual([...]);
```

## Constructors

### Constructor

> **new MockMvcRequestBuilder**(`mockMvc`, `request`): `MockMvcRequestBuilder`

Defined in: packages/blue-test/src/mock-mvc.ts:84

#### Parameters

##### mockMvc

[`MockMvc`](MockMvc.md)

The owning MockMvc.

##### request

[`MockRequest`](../interfaces/MockRequest.md)

The base request spec.

#### Returns

`MockMvcRequestBuilder`

## Methods

### query()

> **query**(`query`): `this`

Defined in: packages/blue-test/src/mock-mvc.ts:94

Add query parameters.

#### Parameters

##### query

`Record`\<`string`, `string`\>

Query parameter map.

#### Returns

`this`

This builder.

***

### body()

> **body**(`body`): `this`

Defined in: packages/blue-test/src/mock-mvc.ts:104

Set the request body.

#### Parameters

##### body

`Record`\<`string`, `unknown`\>

JSON object body.

#### Returns

`this`

This builder.

***

### headers()

> **headers**(`headers`): `this`

Defined in: packages/blue-test/src/mock-mvc.ts:114

Set request headers.

#### Parameters

##### headers

`Record`\<`string`, `string`\>

Header map (lower-cased keys).

#### Returns

`this`

This builder.

***

### cookies()

> **cookies**(`cookies`): `this`

Defined in: packages/blue-test/src/mock-mvc.ts:124

Set cookies.

#### Parameters

##### cookies

`Record`\<`string`, `string`\>

Cookie map.

#### Returns

`this`

This builder.

***

### session()

> **session**(`session`): `this`

Defined in: packages/blue-test/src/mock-mvc.ts:134

Set session data.

#### Parameters

##### session

`Record`\<`string`, `unknown`\>

Session map.

#### Returns

`this`

This builder.

***

### exec()

> **exec**(): `Promise`\<`MockResult`\>

Defined in: packages/blue-test/src/mock-mvc.ts:143

Dispatch the request through the pipeline.

#### Returns

`Promise`\<`MockResult`\>

The mock result (status, headers, parsed body).
