[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / column

# Function: column()

> **column**(`options?`): (`_value`, `context`) => `void`

Decorator that marks a class property as a column in the entity's table.
It can optionally specify column options like name, type, and nullability.

## Parameters

### options?

[`ColumnOptions`](../../metadata/interfaces/ColumnOptions.md)

Options for the column (optional).

## Returns

(`_value`, `context`) => `void`

## Example

```typescript
class User {
  @column({ name: 'first_name', type: 'varchar', nullable: false })
  firstName: string;
}
```
