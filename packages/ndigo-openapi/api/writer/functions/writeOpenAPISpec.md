[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [writer](../README.md) / writeOpenAPISpec

# Function: writeOpenAPISpec()

> **writeOpenAPISpec**(`options`): `void`

Generates an OpenAPI document from route tables and writes it to disk.

## Parameters

### options

[`WriteOpenAPISpecOptions`](../interfaces/WriteOpenAPISpecOptions.md)

Route tables, generator options, and output destination.

## Returns

`void`

Nothing; the document is written to `outPath`.

## Example

```ts
writeOpenAPISpec({ mappings: [mapping], outPath: 'openapi.json' });
```
