[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / ConfigurationPropertiesResult

# Interface: ConfigurationPropertiesResult\<T\>

Defined in: [packages/blue-boot/src/configuration-properties.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-boot/src/configuration-properties.ts#lines-85)

Result of resolving a configuration properties class against an application context.

## Type Parameters

### T

`T`

## Properties

### instance

> **instance**: `T`

Defined in: [packages/blue-boot/src/configuration-properties.ts:87](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-boot/src/configuration-properties.ts#lines-87)

The resolved instance with bound property values.

***

### isValid

> **isValid**: `boolean`

Defined in: [packages/blue-boot/src/configuration-properties.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-boot/src/configuration-properties.ts#lines-89)

Whether all properties resolved successfully.

***

### bindings

> **bindings**: `Record`\<`string`, `JSONValue` \| `undefined`\>

Defined in: [packages/blue-boot/src/configuration-properties.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-boot/src/configuration-properties.ts#lines-91)

Failed paths and their resolved values (or undefined when missing).
