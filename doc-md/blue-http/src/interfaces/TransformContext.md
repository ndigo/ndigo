[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / TransformContext

# Interface: TransformContext

Defined in: packages/blue-http/src/transformers/http-transformer.ts:9

Context information for conditional transformation logic.

## Properties

### url

> `readonly` **url**: `string`

Defined in: packages/blue-http/src/transformers/http-transformer.ts:13

Request URL for URL-based conditional transforms.

***

### headers

> `readonly` **headers**: `Headers`

Defined in: packages/blue-http/src/transformers/http-transformer.ts:18

Request/response headers for header-based conditional logic.

***

### mediaType?

> `readonly` `optional` **mediaType?**: `MediaType`

Defined in: packages/blue-http/src/transformers/http-transformer.ts:24

Media type for content-type-based conditional transforms.

***

### direction

> `readonly` **direction**: `"request"` \| `"response"`

Defined in: packages/blue-http/src/transformers/http-transformer.ts:29

Transform direction: 'request' or 'response'

***

### metadata?

> `readonly` `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: packages/blue-http/src/transformers/http-transformer.ts:34

Additional metadata for custom conditional logic.
