[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / SharedOptions

# Interface: SharedOptions

Defined in: packages/blue-core/src/shared.ts:15

Options for the `@shared` class decorator.

## Properties

### singleton?

> `optional` **singleton?**: `boolean`

Defined in: packages/blue-core/src/shared.ts:17

Whether this bean must be a singleton across the context hierarchy. Default `true`.

***

### version?

> `optional` **version?**: `string`

Defined in: packages/blue-core/src/shared.ts:19

Semver range for this bean, e.g. `'^1.0.0'`. Used to detect version skew.
