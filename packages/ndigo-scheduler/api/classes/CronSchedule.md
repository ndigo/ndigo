[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / CronSchedule

# Class: CronSchedule

A cron-expression schedule (croner syntax — 5, 6, or 7 fields
auto-detected, optional time zone).

Stateless: cron fires at the expression's time sequence, independent of
run duration. Construction validates the expression (croner throws on
malformed patterns); time-zone validity is enforced earlier by the
`@scheduled` decorator's `Intl` probe.

## Implements

- [`Schedule`](../interfaces/Schedule.md)

## Constructors

### Constructor

> **new CronSchedule**(`expression`, `timeZone?`): `CronSchedule`

Creates a cron schedule.

#### Parameters

##### expression

`string`

The cron expression.

##### timeZone?

`string`

Optional IANA time zone the expression is evaluated
  in; when omitted the schedule uses the **system time zone** (pass an
  explicit zone for deterministic behavior).

#### Returns

`CronSchedule`

#### Throws

When the expression does not parse.

## Properties

### intervalMs

> `readonly` **intervalMs**: `number` \| `undefined` = `undefined`

No interval — cron fires per its expression.

#### Implementation of

[`Schedule`](../interfaces/Schedule.md).[`intervalMs`](../interfaces/Schedule.md#intervalms)

***

### kind

> `readonly` **kind**: [`ScheduleKind`](../type-aliases/ScheduleKind.md) = `'cron'`

The schedule kind — always `cron`.

#### Implementation of

[`Schedule`](../interfaces/Schedule.md).[`kind`](../interfaces/Schedule.md#kind)

## Methods

### next()

> **next**(`after`): `Date` \| `null`

Computes the next fire time after the reference.

#### Parameters

##### after

`Date`

The reference event time.

#### Returns

`Date` \| `null`

The next cron fire, or `null` when the pattern never fires
  again (e.g. Feb 30 past the reference).

#### Implementation of

[`Schedule`](../interfaces/Schedule.md).[`next`](../interfaces/Schedule.md#next)
