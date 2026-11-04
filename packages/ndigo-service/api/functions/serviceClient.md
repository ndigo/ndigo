[**@ndigo/service v0.0.1**](../README.md)

***

[@ndigo/service](../README.md) / serviceClient

# Function: serviceClient()

> **serviceClient**\<`T`\>(`target`, `http`): `T`

Builds a runtime service client from `@service`/`@*Call` metadata.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### target

`T`

The `@service`-decorated class/interface constructor or object.

### http

`HTTP`

The `@ndigo/http` client to delegate calls through.

## Returns

`T`

A proxy implementing the declared service methods.

## Example

```ts
const accounts = serviceClient(AccountsAPI, http);
const account = await accounts.getById(42);
```
