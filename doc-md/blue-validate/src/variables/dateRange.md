[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / dateRange

# Variable: dateRange

> `const` **dateRange**: (`params`) => (`value`, `context`) => `void`

Defined in: packages/blue-validate/src/decorators.ts:459

TC39 Stage 3 decorator that validates a date property to be within a specified date range.

## Parameters

### params?

\{ `min?`: `string`; `max?`: `string`; `format?`: `string`; \} \| `DecoratorConfig`\<\{ `min?`: `string`; `max?`: `string`; `format?`: `string`; \}\>

Parameters for the date range constraint.

#### Type Literal

\{ `min?`: `string`; `max?`: `string`; `format?`: `string`; \}

Parameters for the date range constraint.

##### min?

`string`

The minimum allowed date string.

##### max?

`string`

The maximum allowed date string.

##### format?

`string`

Optional date format string (e.g., 'YYYY-MM-DD').

***

`DecoratorConfig`\<\{ `min?`: `string`; `max?`: `string`; `format?`: `string`; \}\>

## Returns

A class field decorator function.

(`value`, `context`) => `void`

## Example

```ts
class MyClass {
  @dateRange({ min: '2023-01-01', max: '2023-12-31', format: 'YYYY-MM-DD' })
  eventDate: string;
}
```
