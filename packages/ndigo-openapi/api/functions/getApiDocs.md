[**@ndigo/openapi v0.0.1**](../README.md)

***

[@ndigo/openapi](../README.md) / getApiDocs

# Function: getApiDocs()

> **getApiDocs**(`target`, `propertyKey`): [`APIDocsMetadata`](../interfaces/APIDocsMetadata.md) \| `undefined`

Read the `@apiDocs` metadata declared on a handler method.

## Parameters

### target

`unknown`

The class prototype or constructor.

### propertyKey

`string` \| `symbol`

The method name.

## Returns

[`APIDocsMetadata`](../interfaces/APIDocsMetadata.md) \| `undefined`

The metadata, or `undefined` when undeclared.
