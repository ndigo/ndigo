[**@ndigo/scheduler v0.0.1**](../../README.md)

***

[@ndigo/scheduler](../../README.md) / [task-scheduler](../README.md) / TaskSchedulerOptions

# Interface: TaskSchedulerOptions

Options for constructing a [TaskScheduler](../classes/TaskScheduler.md).

## Properties

### clock?

> `optional` **clock?**: () => `Date`

Injectable clock; defaults to the system clock. Used for all
bookkeeping (next-fire anchors, completion times).

#### Returns

`Date`

***

### lockDriver?

> `optional` **lockDriver?**: [`LockDriver`](#) \| `null`

The distributed lock driver for `@scheduled({ lock })` tasks
(AD-73). `undefined` (default) resolves the `lockDriver` bean from
the injected application context; pass `null` to leave locked tasks
failing loudly when no bean exists.

***

### warn?

> `optional` **warn?**: (`message`) => `void`

Warning sink (e.g. `maxRunTime` violations); defaults to the
`ndigo-scheduler:task-scheduler` `@ndigo/log` warning channel.

#### Parameters

##### message

`string`

#### Returns

`void`
