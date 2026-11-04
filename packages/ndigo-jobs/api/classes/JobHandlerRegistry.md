[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / JobHandlerRegistry

# Class: JobHandlerRegistry

Holds the job-type → handler mapping. Two registration paths (AD-72 D-5):

- **Declarative** — `@jobHandler('type')` methods on beans are discovered
  when the registry starts (container lifecycle: `SmartLifecycle`, phase 0,
  auto-start; the runner starts in phase 10, after the scan).
- **Programmatic** — [register](#register) for functional handlers and tests.

Duplicate types, handlers on class (not instance) registrations, and
non-callable members all fail loud at start.

## Since

1.0.0

## Constructors

### Constructor

> **new JobHandlerRegistry**(): `JobHandlerRegistry`

#### Returns

`JobHandlerRegistry`

## Properties

### destroyed

> **destroyed**: `boolean` = `false`

Whether this registry has been destroyed.

***

### isAutoStartup

> `readonly` **isAutoStartup**: `true` = `true`

Auto-start on refresh (factory `SmartLifecycle` contract).

***

### isRunning

> **isRunning**: `boolean` = `false`

Whether the lifecycle has started the scan.

***

### phase

> `readonly` **phase**: `0` = `0`

Lifecycle ordering: scanned before the runner (phase 10).

## Accessors

### handlers

#### Get Signature

> **get** **handlers**(): readonly [`RegisteredJobHandler`](../interfaces/RegisteredJobHandler.md)[]

The registered handlers, in registration order.

##### Returns

readonly [`RegisteredJobHandler`](../interfaces/RegisteredJobHandler.md)[]

The handlers.

## Methods

### destroy()

> **destroy**(): `Promise`\<`void`\>

Container teardown: releases the context and registrations.

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`type`): [`RegisteredJobHandler`](../interfaces/RegisteredJobHandler.md) \| `undefined`

Looks up the handler for a job type.

#### Parameters

##### type

`string`

The job type.

#### Returns

[`RegisteredJobHandler`](../interfaces/RegisteredJobHandler.md) \| `undefined`

The handler, or `undefined` when unregistered.

***

### register()

> **register**(`type`, `handler`, `options?`, `name?`): `void`

Registers one handler for a job type.

#### Parameters

##### type

`string`

The job type.

##### handler

[`JobHandler`](../type-aliases/JobHandler.md)

The handler.

##### options?

[`JobHandlerMetadata`](../interfaces/JobHandlerMetadata.md) = `...`

Optional `maxAttempts`/`timeoutMs` overrides.

##### name?

`string` = `type`

Diagnostics name (defaults to `type`).

#### Returns

`void`

#### Throws

When the type is already registered.

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Container injection: stores the context for the auto-start scan.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context.

#### Returns

`void`

***

### start()

> **start**(): `void`

SmartLifecycle start: scans the bound context for `@jobHandler`
methods and registers them. Idempotent.

#### Returns

`void`

#### Throws

When no context is bound or a registration is
  invalid (class instead of instance, non-callable member, duplicate type).

***

### stop()

> **stop**(): `void`

SmartLifecycle stop: clears the discovered registrations. Programmatic
registrations made before `start` are re-added on the next scan only if
they live on scanned beans; functional handlers must be re-registered.

#### Returns

`void`
