[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / CountedRegistry

# Class: CountedRegistry

Defined in: [packages/blue-telemetry/src/metrics/\_registry.ts:6](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/_registry.ts#lines-6)

Registry for prototypes that have been decorated with `counted`.
This allows the `CountedInstrumentation` to discover and wrap these methods
without the decorator itself having to perform the wrapping.

## Constructors

### Constructor

> **new CountedRegistry**(): `CountedRegistry`

#### Returns

`CountedRegistry`

## Methods

### register()

> `static` **register**(`prototype`): `void`

Defined in: [packages/blue-telemetry/src/metrics/\_registry.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/_registry.ts#lines-13)

Registers a prototype for instrumentation.

#### Parameters

##### prototype

`any`

The class prototype to register.

#### Returns

`void`

***

### getPrototypes()

> `static` **getPrototypes**(): `Set`\<`any`\>

Defined in: [packages/blue-telemetry/src/metrics/\_registry.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/_registry.ts#lines-23)

Returns all registered prototypes.

#### Returns

`Set`\<`any`\>

A set of registered prototypes.

***

### clear()

> `static` **clear**(): `void`

Defined in: [packages/blue-telemetry/src/metrics/\_registry.ts:30](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/_registry.ts#lines-30)

Clears the registry.

#### Returns

`void`
