[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ConditionalOnPropertyOptions

# Interface: ConditionalOnPropertyOptions

Defined in: [packages/blue-core/src/conditional.ts:95](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-95)

Options for [conditionalOnProperty](../functions/conditionalOnProperty.md).

## Properties

### name

> **name**: `string`

Defined in: [packages/blue-core/src/conditional.ts:97](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-97)

The property name to check, e.g. `'app.management.enabled'`.

***

### havingValue?

> `optional` **havingValue?**: `string`

Defined in: [packages/blue-core/src/conditional.ts:99](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-99)

Required value; when omitted the property must be present and truthy.

***

### matchIfMissing?

> `optional` **matchIfMissing?**: `boolean`

Defined in: [packages/blue-core/src/conditional.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/conditional.ts#lines-101)

Whether the condition is inverted.
