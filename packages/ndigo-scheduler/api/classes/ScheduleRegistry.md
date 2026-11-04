[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / ScheduleRegistry

# Class: ScheduleRegistry

Discovers `@scheduled` methods on application-context beans, registers
them (telemetry-wrapped) with the context's `taskScheduler` bean, and
manages the scheduler's lifecycle.

As a container bean it is driven by the factory lifecycle (AD-20 D2):
registered by `NodeAutoConfiguration`, injected with the context via
`ApplicationContextAware`, **auto-started on refresh** (`SmartLifecycle`),
and stopped/destroyed on context close — zero extra wiring for Node apps.

Scan model mirrors the handler-mapping scan (`Object.keys(context)` →
per-name value): every bean instance's class metadata is read through
`Symbol.metadata`, and each `schedule:<method>` entry is bound to its
owner instance. A `@scheduled` class registered as a prototype (not an
instance) has no resolvable owner and fails start loudly (AD-20 D5.5).

## Constructors

### Constructor

> **new ScheduleRegistry**(): `ScheduleRegistry`

#### Returns

`ScheduleRegistry`

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

Whether the lifecycle has started the scheduler runtime.

***

### phase

> `readonly` **phase**: `0` = `0`

Lifecycle ordering (factory `Phased` contract).

## Accessors

### tasks

#### Get Signature

> **get** **tasks**(): readonly [`ScheduledTaskDefinition`](../interfaces/ScheduledTaskDefinition.md)[]

The tasks discovered by the last scan.

##### Returns

readonly [`ScheduledTaskDefinition`](../interfaces/ScheduledTaskDefinition.md)[]

## Methods

### close()

> **close**(): `void`

Unregisters the discovered tasks and releases the bound context —
full teardown; the registry can be re-bound via
`setApplicationContext` (or a fresh lifecycle pass).

#### Returns

`void`

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Container teardown: stops and drains, then marks destroyed. The
container does not await the drain (context close is synchronous).

#### Returns

`Promise`\<`void`\>

***

### scan()

> **scan**(`applicationContext`, `scheduler`): `void`

Scans the application context and registers every scheduled method
with the given scheduler (manual alternative to the lifecycle start).

Named `scan`, not `init` — the DI container auto-invokes `init` on
any bean implementing that shape (Initializable), which would collide.

#### Parameters

##### applicationContext

`ApplicationContext`

The context whose beans are scanned.

##### scheduler

[`TaskScheduler`](TaskScheduler.md)

The scheduler tasks are registered with.

#### Returns

`void`

#### Throws

When already initialized or a scheduled
  method's owner cannot be resolved.

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

SmartLifecycle start: scans the context, registers telemetry-wrapped
tasks with the `taskScheduler` bean, and starts the timer loop.

Idempotent; scans once per lifecycle (double-init guard on the
underlying scan).

#### Returns

`void`

#### Throws

When no context is bound or the context has
  no `taskScheduler` bean (the node platform provides one).

***

### stop()

> **stop**(): `void`

SmartLifecycle stop: stops the timer loop and unregisters the scanned
tasks. In-flight runs continue; `destroy` drains them.

Unlike [ScheduleRegistry.close](#close), stop keeps the context and
scheduler bindings so a subsequent `start()` can re-scan and resume —
lifecycle stop/start cycles on the same registry are supported.

#### Returns

`void`
