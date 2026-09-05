[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ConditionalOnPropertyOptions

# Interface: ConditionalOnPropertyOptions

Defined in: packages/blue-core/src/conditional.ts:100

Options for [conditionalOnProperty](../functions/conditionalOnProperty.md).

## Properties

### name

> **name**: `string`

Defined in: packages/blue-core/src/conditional.ts:102

The property name to check, e.g. `'app.management.enabled'`.

***

### havingValue?

> `optional` **havingValue?**: `string`

Defined in: packages/blue-core/src/conditional.ts:104

Required value; when omitted the property must be present and truthy.

***

### matchIfMissing?

> `optional` **matchIfMissing?**: `boolean`

Defined in: packages/blue-core/src/conditional.ts:106

Whether the condition is inverted.
