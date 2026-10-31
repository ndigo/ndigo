[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / TransformContext

# Interface: TransformContext

Context information for conditional transformation logic.

## Properties

### direction

> `readonly` **direction**: `"request"` \| `"response"`

Transform direction: 'request' or 'response'

***

### headers

> `readonly` **headers**: `Headers`

Request/response headers for header-based conditional logic.

***

### mediaType

> `readonly` **mediaType**: `MediaType` \| `null` \| `undefined`

Media type for content-type-based conditional transforms.

***

### metadata?

> `readonly` `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Additional metadata for custom conditional logic.

***

### url

> `readonly` **url**: `string`

Request URL for URL-based conditional transforms.
