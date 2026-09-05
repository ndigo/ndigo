[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / AbstractCookieValueMethodArgumentResolver

# Abstract Class: AbstractCookieValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:7

Resolves a method parameter into an argument value from a given route.

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractCookieValueMethodArgumentResolver**(`factory?`): `AbstractCookieValueMethodArgumentResolver`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:33

#### Parameters

##### factory?

[`Factory`](../../../blue-factory/src/interfaces/Factory.md)

#### Returns

`AbstractCookieValueMethodArgumentResolver`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md).[`constructor`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md#constructor)

## Methods

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:37

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md).[`handleMissingValue`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md#handlemissingvalue)

---

### resolveArgument()

> `abstract` **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:41

#### Parameters

##### parameter

[`MethodParameter`](../../../blue-dispatcher/src/classes/MethodParameter.md)

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### mapping

`any`

#### Returns

`any`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md#resolveargument)

---

### supportsParameter()

> `abstract` **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:42

#### Parameters

##### parameter

[`MethodParameter`](../../../blue-dispatcher/src/classes/MethodParameter.md)

#### Returns

`boolean`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](../../../blue-dispatcher/src/classes/AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
