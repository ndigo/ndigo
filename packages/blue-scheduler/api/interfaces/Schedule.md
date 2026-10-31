[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / Schedule

# Interface: Schedule

A stateless schedule: given a reference event, when does it fire next?

The engine passes the current time when establishing the next fire and the
relevant anchor afterwards — the fire time for cron and fixed-rate, the
completion time for fixed-delay. `next()` must return a time strictly
after the reference (or `null` when it never fires again).

## Properties

### intervalMs

> `readonly` **intervalMs**: `number` \| `undefined`

The interval in milliseconds — set for `fixedRate`/`fixedDelay`
schedules, `undefined` for cron.

***

### kind

> `readonly` **kind**: [`ScheduleKind`](../type-aliases/ScheduleKind.md)

The trigger kind (drives engine bookkeeping).

## Methods

### next()

> **next**(`after`): `Date` \| `null`

Computes the next fire time after the reference event.

#### Parameters

##### after

`Date`

The reference event time.

#### Returns

`Date` \| `null`

The next fire time, or `null` when the schedule never fires
  again (after this reference).
