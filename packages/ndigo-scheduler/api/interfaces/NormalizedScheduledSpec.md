[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / NormalizedScheduledSpec

# Interface: NormalizedScheduledSpec

The normalized, validated schedule record written into `Symbol.metadata`
by `@scheduled` (AD-20 D1).

## Properties

### cron?

> `readonly` `optional` **cron?**: `string`

***

### fixedDelayMs?

> `readonly` `optional` **fixedDelayMs?**: `number`

***

### fixedRateMs?

> `readonly` `optional` **fixedRateMs?**: `number`

***

### lockKey?

> `readonly` `optional` **lockKey?**: `string`

Distributed lock key (AD-73), when the spec declared `lock`.

***

### lockTtlMs?

> `readonly` `optional` **lockTtlMs?**: `number`

Lock lease duration in milliseconds.

***

### lockWaitMs?

> `readonly` `optional` **lockWaitMs?**: `number`

Contended-lock wait budget in milliseconds (`0` = skip immediately).

***

### lockWaitStepMs?

> `readonly` `optional` **lockWaitStepMs?**: `number`

Contended-lock poll interval in milliseconds.

***

### maxRunTimeMs?

> `readonly` `optional` **maxRunTimeMs?**: `number`

***

### timeZone?

> `readonly` `optional` **timeZone?**: `string`
