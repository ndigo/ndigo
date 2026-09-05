[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / InvalidRelayError

# Class: InvalidRelayError

Defined in: [packages/blue-context/src/event-gateway.ts:209](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-209)

Error thrown when a relay is rejected and throw-on-invalid mode is enabled.

## Extends

- `FrameworkError`

## Constructors

### Constructor

> **new InvalidRelayError**(`message`): `InvalidRelayError`

Defined in: [packages/blue-context/src/event-gateway.ts:219](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-219)

Creates an invalid-relay error.

#### Parameters

##### message

`string`

The error message.

#### Returns

`InvalidRelayError`

#### Overrides

`FrameworkError.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-context/src/event-gateway.ts:210](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/event-gateway.ts#lines-210)

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`
