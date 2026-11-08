[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [page](../README.md) / pageFromAll

# Function: pageFromAll()

> **pageFromAll**\<`T`\>(`all`, `request`, `allowedProperties`): [`Page`](../interfaces/Page.md)\<`T`\>

Sorts and slices a full result set into a page (in-memory backends).
Multi-key sort is stable per clause; ties keep their input order.

## Type Parameters

### T

`T`

## Parameters

### all

`T`[]

The full result set.

### request

[`PageRequest`](../interfaces/PageRequest.md)

The page request.

### allowedProperties

`Set`\<`string`\>

The entity field names sort properties may name.

## Returns

[`Page`](../interfaces/Page.md)\<`T`\>

The requested page and totals.
