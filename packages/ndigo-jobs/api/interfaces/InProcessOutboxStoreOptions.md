[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / InProcessOutboxStoreOptions

# Interface: InProcessOutboxStoreOptions

Options for [InProcessOutboxStore](../classes/InProcessOutboxStore.md).

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
