[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / ApplicationEventEmitterAware

# Interface: ApplicationEventEmitterAware

Defined in: [packages/blue-context/src/event-emitter.ts:169](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-169)

Receives the application event emitter during initialization.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setApplicationEventEmitter()

> **setApplicationEventEmitter**(`eventEmitter`): `void`

Defined in: [packages/blue-context/src/event-emitter.ts:175](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-emitter.ts#lines-175)

Receives the application event emitter.

#### Parameters

##### eventEmitter

[`EventEmitter`](EventEmitter.md)

The event emitter to inject.

#### Returns

`void`
