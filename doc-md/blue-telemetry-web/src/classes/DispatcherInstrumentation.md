[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry-web/src](../README.md) / DispatcherInstrumentation

# Class: DispatcherInstrumentation

Defined in: [packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts#lines-12)

An OpenTelemetry instrumentation for the `@blue/dispatcher` package.

This instrumentation automatically creates spans for the `dispatch` method,
providing visibility into route dispatching processes.

## Extends

- `BaseBlueInstrumentation`

## Constructors

### Constructor

> **new DispatcherInstrumentation**(): `DispatcherInstrumentation`

Defined in: [packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts#lines-13)

#### Returns

`DispatcherInstrumentation`

#### Overrides

`BaseBlueInstrumentation.constructor`

## Methods

### init()

> `protected` **init**(): `any`[]

Defined in: [packages/blue-telemetry-web/src/instrumentation/base.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/base.ts#lines-64)

#### Returns

`any`[]

#### Inherit Doc

#### Inherited from

`BaseBlueInstrumentation.init`

***

### \_patchCount()

> `protected` **\_patchCount**(`config`): (`original`) => (`this`, ...`args`) => `any`

Defined in: [packages/blue-telemetry-web/src/instrumentation/base.ts:77](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/base.ts#lines-77)

Returns a synchronous patch function that increments a counter.

#### Parameters

##### config

`CountConfig`

#### Returns

(`original`) => (`this`, ...`args`) => `any`

#### Inherited from

`BaseBlueInstrumentation._patchCount`

***

### \_patchSync()

> `protected` **\_patchSync**(`config`): (`original`) => (`this`, ...`args`) => `any`

Defined in: [packages/blue-telemetry-web/src/instrumentation/base.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/base.ts#lines-93)

Returns a synchronous patch function that wraps the original method
in a span with the given configuration.

#### Parameters

##### config

`SpanConfig`

#### Returns

(`original`) => (`this`, ...`args`) => `any`

#### Inherited from

`BaseBlueInstrumentation._patchSync`

***

### \_patchAsync()

> `protected` **\_patchAsync**(`config`): (`original`) => (`this`, ...`args`) => `Promise`\<`any`\>

Defined in: [packages/blue-telemetry-web/src/instrumentation/base.ts:119](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/base.ts#lines-119)

Returns an asynchronous patch function that wraps the original method
in an active span with the given configuration.

#### Parameters

##### config

`SpanConfig`

#### Returns

(`original`) => (`this`, ...`args`) => `Promise`\<`any`\>

#### Inherited from

`BaseBlueInstrumentation._patchAsync`

***

### enable()

> **enable**(): `void`

Defined in: [packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts#lines-17)

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

`BaseBlueInstrumentation.enable`

***

### disable()

> **disable**(): `void`

Defined in: [packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-web/src/instrumentation/dispatcher/dispatcher.ts#lines-53)

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

`BaseBlueInstrumentation.disable`
