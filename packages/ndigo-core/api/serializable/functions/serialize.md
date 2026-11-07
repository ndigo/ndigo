[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [serializable](../README.md) / serialize

# Function: serialize()

> **serialize**(`value`): [`JSONValue`](../type-aliases/JSONValue.md)

Converts an arbitrary value into a JSON-safe representation.

## Parameters

### value

`unknown`

Value to serialize.

## Returns

[`JSONValue`](../type-aliases/JSONValue.md)

A JSON-compatible value derived from the best available serialization strategy.

## Example

```ts
serialize({ when: new Date('2026-01-01T00:00:00Z') }); // { when: '2026-01-01T00:00:00.000Z' }
```
