[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry-node/src](../README.md) / HTTPServerInstrumentation

# Class: HTTPServerInstrumentation

Defined in: [packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts:30](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts#lines-30)

Instrumentation for `HTTPServer.listen`/`close` and per-request handling.

## Example

```ts
configureTelemetry({
  instrumentations: [new HTTPServerInstrumentation()],
});
```

## Extends

- `BaseBlueInstrumentation`

## Constructors

### Constructor

> **new HTTPServerInstrumentation**(): `HTTPServerInstrumentation`

Defined in: [packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts#lines-31)

#### Returns

`HTTPServerInstrumentation`

#### Overrides

`BaseBlueInstrumentation.constructor`

## Methods

### init()

> `protected` **init**(): `any`[]

Defined in: [packages/blue-telemetry-node/src/instrumentation/base.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/base.ts#lines-64)

#### Returns

`any`[]

#### Inherit Doc

#### Inherited from

`BaseBlueInstrumentation.init`

***

### \_patchCount()

> `protected` **\_patchCount**(`config`): (`original`) => (`this`, ...`args`) => `any`

Defined in: [packages/blue-telemetry-node/src/instrumentation/base.ts:77](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/base.ts#lines-77)

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

Defined in: [packages/blue-telemetry-node/src/instrumentation/base.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/base.ts#lines-93)

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

Defined in: [packages/blue-telemetry-node/src/instrumentation/base.ts:119](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/base.ts#lines-119)

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

Defined in: [packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts#lines-35)

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

`BaseBlueInstrumentation.enable`

***

### disable()

> **disable**(): `void`

Defined in: [packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts#lines-85)

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

`BaseBlueInstrumentation.disable`
