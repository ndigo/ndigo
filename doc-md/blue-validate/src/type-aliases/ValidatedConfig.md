[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / ValidatedConfig

# Type Alias: ValidatedConfig

> **ValidatedConfig** = `object`

Defined in: packages/blue-validate/src/decorators.ts:556

Options for the `@validated` class decorator.

## Properties

### groups?

> `optional` **groups?**: [`ValidationGroup`](ValidationGroup.md)[]

Defined in: packages/blue-validate/src/decorators.ts:557

***

### backend?

> `optional` **backend?**: [`ValidationBackendName`](ValidationBackendName.md)

Defined in: packages/blue-validate/src/decorators.ts:562

Backend adapter to use for constraint validation. Defaults to 'native'.
Currently only the native BlueJS backend is available.
