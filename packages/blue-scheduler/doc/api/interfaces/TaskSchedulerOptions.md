[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / TaskSchedulerOptions

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

### warn?

> `optional` **warn?**: (`message`) => `void`

Warning sink (e.g. `maxRunTime` violations); defaults to the
`blue-scheduler:task-scheduler` `@blue/log` warning channel.

#### Parameters

##### message

`string`

#### Returns

`void`
