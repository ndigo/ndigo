[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-cross-paradigm-decorators](../README.md) / noCrossParadigmDecorators

# Variable: noCrossParadigmDecorators

> `const` **noCrossParadigmDecorators**: `object`

Reports classes mixing service-call and server-route-mapping decorators (on
the class OR any of its methods).

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow mixing service-call and route-mapping decorators on one class"` = `'Disallow mixing service-call and route-mapping decorators on one class'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.mixedParadigms

> `readonly` **mixedParadigms**: `"Class '{{name}}' mixes {{call}} (service-call decorator) with {{mapping}} (route-mapping decorator). Use @service/@*Call for client service calls and @routeMapping/@*Mapping for server handlers — never both on one class."` = `"Class '{{name}}' mixes {{call}} (service-call decorator) with {{mapping}} (route-mapping decorator). Use @service/@*Call for client service calls and @routeMapping/@*Mapping for server handlers — never both on one class."`

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

##### before()

> **before**(): `void`

###### Returns

`void`

##### ClassDeclaration()

> **ClassDeclaration**(`node`): `void`

###### Parameters

###### node

`Class`

###### Returns

`void`
