[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / ScheduledTaskDefinition

# Interface: ScheduledTaskDefinition

A runnable scheduled task as registered with [TaskScheduler](../classes/TaskScheduler.md).

## Properties

### lockKey?

> `readonly` `optional` **lockKey?**: `string`

Distributed lock key (AD-73): the scheduler acquires the named lock
before each run and releases it after (finally-style), so only one
node executes this task at a time.

***

### lockTtlMs?

> `readonly` `optional` **lockTtlMs?**: `number`

Lock lease duration (ms). Must cover the whole run — a lease that
lapses mid-run lets another node take over (at-least-once posture).

***

### lockWaitMs?

> `readonly` `optional` **lockWaitMs?**: `number`

How long to wait for a contended lock before skipping the fire
(ms; `0`/absent = skip immediately on contention).

***

### lockWaitStepMs?

> `readonly` `optional` **lockWaitStepMs?**: `number`

Poll interval while waiting for a contended lock (ms).

***

### maxRunTimeMs?

> `readonly` `optional` **maxRunTimeMs?**: `number`

Optional cap: when a run exceeds this duration the single-flight slot
is released and a warning is emitted. The task itself is not
cancelled — Node has no preemptive cancellation (AD-20 D4).

***

### name

> `readonly` **name**: `string`

Unique task name (used in diagnostics and stats).

***

### schedule

> `readonly` **schedule**: [`Schedule`](Schedule.md)

The schedule deciding when the task fires.

## Methods

### run()

> **run**(): `void` \| `Promise`\<`void`\>

Executes the task once.

#### Returns

`void` \| `Promise`\<`void`\>
