[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / SharedOptions

# Interface: SharedOptions

Defined in: [packages/blue-core/src/shared.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/shared.ts#lines-16)

Options for the `@shared` class decorator.

## Properties

### singleton?

> `optional` **singleton?**: `boolean`

Defined in: [packages/blue-core/src/shared.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/shared.ts#lines-18)

Whether this entry must be a singleton across the context hierarchy. Default `true`.

***

### version?

> `optional` **version?**: `string`

Defined in: [packages/blue-core/src/shared.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/shared.ts#lines-20)

Semver range for this entry, e.g. `'^1.0.0'`. Used to detect version skew.
