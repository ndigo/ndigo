[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / TaskScheduler

# Class: TaskScheduler

The task-execution engine: next-fire tracking, single-flight runs, error
isolation, `maxRunTime` races, and drain-on-close (AD-20 D4).

The engine is driven two ways:
- `tick(now)` — deterministic, testable, and suited to an application
  loop: fires every due task and awaits the runs it started.
- `start()`/`stop()` — a wall-clock timer chain that calls `tick` at each
  computed next-fire time (fire-and-forget; single-flight guards overlap).

## Constructors

### Constructor

> **new TaskScheduler**(`options?`): `TaskScheduler`

Creates a task scheduler.

#### Parameters

##### options?

[`TaskSchedulerOptions`](../interfaces/TaskSchedulerOptions.md) = `{}`

Clock, warning-sink, and lock-driver injection.

#### Returns

`TaskScheduler`

## Properties

### destroyed

> **destroyed**: `boolean` = `false`

## Accessors

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

Whether the wall-clock timer loop is started.

True from `start()` until `stop()` even while no timer is armed — a
started loop with no registered tasks has nothing to wake for, but it
will arm as soon as a task is registered.

##### Returns

`boolean`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Stops the loop, drains in-flight runs, and clears the registry.

Tasks are cleared on close; the scheduler is closed for further
registration.

#### Returns

`Promise`\<`void`\>

***

### destroy()

> **destroy**(): `Promise`\<`void`\>

Container contract (AD-20): stops the loop, drains in-flight runs, and
clears the registry — the same work as [TaskScheduler.close](#close).

The container does not await the drain (context close is synchronous);
in-flight runs finish in the background and the scheduler rejects new
registrations immediately.

#### Returns

`Promise`\<`void`\>

***

### getStats()

> **getStats**(`name`): [`TaskStats`](../interfaces/TaskStats.md) \| `undefined`

Observable statistics for a task.

#### Parameters

##### name

`string`

The task name.

#### Returns

[`TaskStats`](../interfaces/TaskStats.md) \| `undefined`

The task statistics, or `undefined` when not registered.

***

### register()

> **register**(`definition`): `void`

Registers a task; its first fire is computed from the current clock.

When the loop is already started, the timer is re-armed so a task
registered after `start()` (or one due earlier than the armed timer)
fires on time.

#### Parameters

##### definition

[`ScheduledTaskDefinition`](../interfaces/ScheduledTaskDefinition.md)

The task to register.

#### Returns

`void`

#### Throws

On duplicate names or after `close()`.

***

### setApplicationContext()

> **setApplicationContext**(`context`): `void`

Container injection (`ApplicationContextAware`): the context is used
to resolve the `lockDriver` bean for [\* locked](../interfaces/ScheduledTaskDefinition.md) tasks when no driver was passed to the constructor (AD-73).

#### Parameters

##### context

`ApplicationContext`

The application context.

#### Returns

`void`

***

### start()

> **start**(): `void`

Starts the wall-clock timer loop (idempotent). Fire-and-forget: ticks
are not awaited, so long runs never delay the loop — single-flight
prevents same-task overlap.

The started latch is set even when no tasks are registered, so
registering one later arms the loop.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Stops the wall-clock timer loop. In-flight runs continue; call
[TaskScheduler.close](#close) to drain.

#### Returns

`void`

***

### taskNames()

> **taskNames**(): `string`[]

The names of all registered tasks.

#### Returns

`string`[]

The task names in registration order.

***

### tick()

> **tick**(`now?`): `Promise`\<`number`\>

Advances the scheduler to `now` and fires every due task.

Overlapping runs are skipped (single-flight): the task's next fire is
slid forward. Runs started by this tick are awaited before it returns,
so tests are deterministic; run failures never propagate.

#### Parameters

##### now?

`Date`

The time to advance to; defaults to the injected clock.

#### Returns

`Promise`\<`number`\>

How many runs started.

***

### unregister()

> **unregister**(`name`): `boolean`

Removes a task.

When the loop is started, the timer is re-armed so the next wake
reflects the remaining tasks (a removed earliest task no longer
leaves a stale timer).

#### Parameters

##### name

`string`

The task name.

#### Returns

`boolean`

Whether a task was removed.
