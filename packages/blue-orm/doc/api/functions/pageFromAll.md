[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / pageFromAll

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

### request

[`PageRequest`](../interfaces/PageRequest.md)

### allowedProperties

`Set`\<`string`\>

## Returns

[`Page`](../interfaces/Page.md)\<`T`\>
