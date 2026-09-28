[**@blue/openapi v0.0.1**](../README.md)

***

[@blue/openapi](../README.md) / apiDocs

# Function: apiDocs()

> **apiDocs**(`docs`): (`_target`, `context`) => `void`

Decorator: attach documentation metadata to a handler method.

Method-only — the spec generator reads it off the handler's prototype, so
class-level docs have no carrier (annotate each method).

## Parameters

### docs

[`APIDocsMetadata`](../interfaces/APIDocsMetadata.md)

The metadata to attach.

## Returns

A method decorator.

(`_target`, `context`) => `void`

## Example

```ts
@getMapping('/reports')
@parameters({ from: queryValue('from') })
@apiDocs({ summary: 'List reports', tags: ['reports'] })
list(from: string | undefined) { … }
```
