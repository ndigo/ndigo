[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / ValidatedConfig

# Type Alias: ValidatedConfig

> **ValidatedConfig** = `object`

Defined in: [packages/blue-validate/src/decorators.ts:554](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-554)

Options for the `@validated` class decorator.

## Properties

### groups?

> `optional` **groups?**: [`ValidationGroup`](ValidationGroup.md)[]

Defined in: [packages/blue-validate/src/decorators.ts:555](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-555)

***

### backend?

> `optional` **backend?**: [`ValidationBackendName`](ValidationBackendName.md)

Defined in: [packages/blue-validate/src/decorators.ts:560](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-560)

Backend adapter to use for constraint validation. Defaults to 'native'.
Currently only the native BlueJS backend is available.
