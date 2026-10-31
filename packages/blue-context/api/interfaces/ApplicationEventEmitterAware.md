[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ApplicationEventEmitterAware

# Interface: ApplicationEventEmitterAware

Receives the application event emitter during initialization.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setApplicationEventEmitter()

> **setApplicationEventEmitter**(`eventEmitter`): `void`

Receives the application event emitter.

#### Parameters

##### eventEmitter

[`EventEmitter`](EventEmitter.md)

The event emitter to inject.

#### Returns

`void`
