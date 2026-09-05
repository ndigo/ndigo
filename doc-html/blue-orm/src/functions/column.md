[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / column

# Function: column()

> **column**(`options?`): (`_value`, `context`) => `void`

Defined in: [packages/blue-orm/src/decorators.ts:58](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-orm/src/decorators.ts#lines-58)

Decorator that marks a class property as a column in the entity's table.
It can optionally specify column options like name, type, and nullability.

## Parameters

### options?

[`ColumnOptions`](../interfaces/ColumnOptions.md)

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
