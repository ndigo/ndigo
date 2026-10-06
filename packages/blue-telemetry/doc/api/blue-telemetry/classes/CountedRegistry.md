[**@blue/telemetry v0.0.1**](../../README.md)

***

[@blue/telemetry](../../README.md) / [blue-telemetry](../README.md) / CountedRegistry

# Class: CountedRegistry

## Constructors

### Constructor

> **new CountedRegistry**(): `CountedRegistry`

#### Returns

`CountedRegistry`

## Methods

### clear()

> `static` **clear**(): `void`

Clears the registry.

#### Returns

`void`

***

### getPrototypes()

> `static` **getPrototypes**(): `Set`\<`object`\>

Returns all registered prototypes.

#### Returns

`Set`\<`object`\>

A set of registered prototypes.

***

### register()

> `static` **register**(`prototype`): `void`

Registers a prototype for instrumentation.

#### Parameters

##### prototype

`object`

The class prototype to register.

#### Returns

`void`
