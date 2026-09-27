[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / ConditionalOnPropertyOptions

# Interface: ConditionalOnPropertyOptions

Options for [conditionalOnProperty](../functions/conditionalOnProperty.md).

## Properties

### havingValue?

> `optional` **havingValue?**: `string`

Required value; when omitted the property must be present and truthy.

***

### matchIfMissing?

> `optional` **matchIfMissing?**: `boolean`

Whether the condition is inverted.

***

### name

> **name**: `string`

The property name to check, e.g. `'app.management.enabled'`.
