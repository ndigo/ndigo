[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [in-process-job-driver](../README.md) / InProcessJobDriver

# Class: InProcessJobDriver

Map-backed [JobDriver](../../job-driver/interfaces/JobDriver.md) with the full contract semantics — `runAt`
ordering, attempts-at-claim, lease expiry reclaimed inside `claim`, and
terminal `complete`/`fail`.

**Not durable**: jobs vanish with the process. It is the zero-wiring default
for development and tests; register a durable driver (`LibSQLJobStore`,
`RedisJobDriver`) for work that must survive a restart (AD-72 D-1).

Payloads round-trip through JSON like every driver, so handlers see the
same shape they would after a restart.

## Implements

- [`JobDriver`](../../job-driver/interfaces/JobDriver.md)

## Constructors

### Constructor

> **new InProcessJobDriver**(`options?`): `InProcessJobDriver`

#### Parameters

##### options?

[`InProcessJobDriverOptions`](../interfaces/InProcessJobDriverOptions.md) = `{}`

Clock/id overrides for deterministic tests.

#### Returns

`InProcessJobDriver`

## Properties

### kind

> `readonly` **kind**: `"in-process"` = `'in-process'`

Backend discriminator (`'in-process'`, `'libsql'`, `'redis'`).

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`kind`](../../job-driver/interfaces/JobDriver.md#kind)

## Methods

### claim()

> **claim**(`options`): `Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)[]\>

#### Parameters

##### options

[`ClaimOptions`](../../job/interfaces/ClaimOptions.md)

#### Returns

`Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)[]\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`claim`](../../job-driver/interfaces/JobDriver.md#claim)

***

### close()

> **close**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`close`](../../job-driver/interfaces/JobDriver.md#close)

***

### complete()

> **complete**(`id`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`complete`](../../job-driver/interfaces/JobDriver.md#complete)

***

### enqueue()

> **enqueue**(`request`): `Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)\>

#### Parameters

##### request

[`JobRequest`](../../job/interfaces/JobRequest.md)

#### Returns

`Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`enqueue`](../../job-driver/interfaces/JobDriver.md#enqueue)

***

### fail()

> **fail**(`id`, `lastError`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

##### lastError

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`fail`](../../job-driver/interfaces/JobDriver.md#fail)

***

### heartbeat()

> **heartbeat**(`id`, `leaseMs`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

##### leaseMs

`number`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`heartbeat`](../../job-driver/interfaces/JobDriver.md#heartbeat)

***

### retry()

> **retry**(`id`, `runAt`, `lastError`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

##### runAt

`number`

##### lastError

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`retry`](../../job-driver/interfaces/JobDriver.md#retry)

***

### size()

> **size**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`size`](../../job-driver/interfaces/JobDriver.md#size)
