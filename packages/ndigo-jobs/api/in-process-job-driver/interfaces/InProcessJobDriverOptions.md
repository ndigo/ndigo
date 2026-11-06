[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [in-process-job-driver](../README.md) / InProcessJobDriverOptions

# Interface: InProcessJobDriverOptions

Options for [InProcessJobDriver](../classes/InProcessJobDriver.md).

## Properties

### clock?

> `optional` **clock?**: () => `number`

Clock override for deterministic tests; defaults to `Date.now`.

#### Returns

`number`

***

### idFactory?

> `optional` **idFactory?**: () => `string`

Id factory override; defaults to `crypto.randomUUID`.

#### Returns

`string`
