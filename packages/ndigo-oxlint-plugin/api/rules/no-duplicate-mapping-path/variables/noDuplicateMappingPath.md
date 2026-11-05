[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-duplicate-mapping-path](../README.md) / noDuplicateMappingPath

# Variable: noDuplicateMappingPath

> `const` **noDuplicateMappingPath**: `object`

Reports duplicate method-level mapping paths within one class.

The dispatcher's radix registration model keys by the normalized path, so
two method registrations with the same HTTP-method identity whose spellings
normalize to the same node (`/foo` and `/foo/`, `/a/:id` and `/a/{id}`)
target the same node and shadow each other. Distinct parameter labels
(`/a/:id` vs `/a/:name`) are different nodes and are not flagged.

Grouping is by resolved HTTP-method identity (see [DECORATOR\_METHOD](#)),
not by decorator name, so the method-less forms collapse into one family:
`@requestMapping('/y')` and `@routeMapping('/y')` shadow each other, as do
`@publicMapping`/`@privateMapping`/`@socketMapping`/`@stompMapping`.

Conservative narrowing:

- Class-level decorators are ignored: a class-level path is a prefix merged
  with its method paths (`RouteMappingInfo.merge`), not a registration of
  its own, so `@requestMapping('/')` + `@getMapping('/')` is not a duplicate.
- Registrations are grouped by normalized path AND HTTP-method identity: a
  `@getMapping('/x')` and a `@postMapping('/x')` differ by method and are not
  duplicates.
- A configuration-form decorator is only compared when `value` is its sole
  property; any additional condition (`matrixParams`, `params`, `produces`,
  `method`, …) disambiguates the registration.

Scope is best-effort and class-local: only mapping decorators syntactically
attached to methods of a single class declaration are compared. Paths
composed dynamically, or contributed by a base class, are not seen.

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow duplicate method-level route-mapping paths of the same HTTP-method identity within a class"` = `'Disallow duplicate method-level route-mapping paths of the same HTTP-method identity within a class'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.duplicateMappingPath

> `readonly` **duplicateMappingPath**: `"Duplicate @{{decorator}} mapping path '{{path}}' (normalized '{{normalized}}', method {{method}}) — already mapped by @{{firstDecorator}}('{{first}}') in this class. Both target the same radix node for the same HTTP method, so the later registration shadows the earlier; remove or disambiguate one."` = `"Duplicate @{{decorator}} mapping path '{{path}}' (normalized '{{normalized}}', method {{method}}) — already mapped by @{{firstDecorator}}('{{first}}') in this class. Both target the same radix node for the same HTTP method, so the later registration shadows the earlier; remove or disambiguate one."`

#### meta.schema

> `readonly` **schema**: readonly \[\] = `[]`

#### meta.type

> `readonly` **type**: `"problem"` = `'problem'`

### create()

> **create**(`context`): `object`

#### Parameters

##### context

`Context`

#### Returns

`object`

##### ClassDeclaration()

> **ClassDeclaration**(`node`): `void`

###### Parameters

###### node

`Class`

###### Returns

`void`

##### ClassExpression()

> **ClassExpression**(`node`): `void`

###### Parameters

###### node

`Class`

###### Returns

`void`

##### Program()

> **Program**(`node`): `void`

###### Parameters

###### node

`Program`

###### Returns

`void`
