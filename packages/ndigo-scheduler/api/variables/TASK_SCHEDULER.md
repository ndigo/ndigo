[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / TASK\_SCHEDULER

# Variable: TASK\_SCHEDULER

> `const` **TASK\_SCHEDULER**: [`ContextToken`](#)\<[`TaskScheduler`](../classes/TaskScheduler.md)\>

Token for the node platform's [TaskScheduler](../classes/TaskScheduler.md) bean. The node
auto-configuration registers the `taskScheduler()` entry;
consumers resolve it with `context.getValue(TASK_SCHEDULER)`.
