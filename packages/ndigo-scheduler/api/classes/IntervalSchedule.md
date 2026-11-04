[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / IntervalSchedule

# Class: IntervalSchedule

A fixed-interval schedule: every `intervalMs` from an anchor.

The anchor depends on the kind — `fixedRate` anchors at run start,
`fixedDelay` at run completion — which the engine applies; this schedule
only answers "the anchor plus the interval".

## Implements

- [`Schedule`](../interfaces/Schedule.md)

## Constructors

### Constructor

> **new IntervalSchedule**(`kind`, `intervalMs`): `IntervalSchedule`

Creates an interval schedule.

#### Parameters

##### kind

`"fixedRate"` \| `"fixedDelay"`

`fixedRate` (start-anchored) or `fixedDelay`
  (end-anchored).

##### intervalMs

`number`

The interval in milliseconds; must be positive.

#### Returns

`IntervalSchedule`

#### Throws

When the interval is not positive.

## Properties

### intervalMs

> `readonly` **intervalMs**: `number`

The interval in milliseconds.

#### Implementation of

[`Schedule`](../interfaces/Schedule.md).[`intervalMs`](../interfaces/Schedule.md#intervalms)

***

### kind

> `readonly` **kind**: [`ScheduleKind`](../type-aliases/ScheduleKind.md)

The trigger kind — `fixedRate` or `fixedDelay`.

#### Implementation of

[`Schedule`](../interfaces/Schedule.md).[`kind`](../interfaces/Schedule.md#kind)

## Methods

### next()

> **next**(`after`): `Date` \| `null`

Computes the next fire time: the reference plus the interval.

#### Parameters

##### after

`Date`

The anchor event time (run start or completion).

#### Returns

`Date` \| `null`

The next fire time.

#### Implementation of

[`Schedule`](../interfaces/Schedule.md).[`next`](../interfaces/Schedule.md#next)
