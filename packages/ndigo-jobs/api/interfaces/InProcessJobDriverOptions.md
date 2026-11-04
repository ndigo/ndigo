[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / InProcessJobDriverOptions

# Interface: InProcessJobDriverOptions

Options for [InProcessJobDriver](../classes/InProcessJobDriver.md).

## Since

1.0.0

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
