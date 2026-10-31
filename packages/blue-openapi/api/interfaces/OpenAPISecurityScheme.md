[**@blue/openapi v0.0.1**](../README.md)

***

[@blue/openapi](../README.md) / OpenAPISecurityScheme

# Interface: OpenAPISecurityScheme

An OpenAPI security scheme object (the subset the generator carries).
Declared through [OpenAPIGeneratorOptions.securitySchemes](OpenAPIGeneratorOptions.md#securityschemes) and
referenced by name from operation/`@apiDocs` `security` requirements.

## Properties

### bearerFormat?

> `optional` **bearerFormat?**: `string`

`http` bearer: the bearer format hint.

***

### description?

> `optional` **description?**: `string`

***

### flows?

> `optional` **flows?**: `Record`\<`string`, `unknown`\>

`oauth2`: flow definitions.

***

### in?

> `optional` **in?**: `"query"` \| `"header"` \| `"cookie"`

`apiKey`: where the key travels.

***

### name?

> `optional` **name?**: `string`

`apiKey`: the header/query/cookie name.

***

### openIdConnectUrl?

> `optional` **openIdConnectUrl?**: `string`

`openIdConnect`: discovery URL.

***

### scheme?

> `optional` **scheme?**: `string`

`http`: the scheme (e.g. `bearer`, `basic`).

***

### type

> **type**: `"apiKey"` \| `"http"` \| `"oauth2"` \| `"openIdConnect"`
