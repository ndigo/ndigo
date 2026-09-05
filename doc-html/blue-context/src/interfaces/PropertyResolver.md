[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / PropertyResolver

# Interface: PropertyResolver

Defined in: [packages/blue-context/src/property-resolver.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-12)

Resolves property values from a configured set of sources.

## Extended by

- [`Environment`](Environment.md)
- [`ConfigurablePropertyResolver`](ConfigurablePropertyResolver.md)

## Methods

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Defined in: [packages/blue-context/src/property-resolver.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-20)

Resolves a property value, falling back to a default when missing.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when no property is found.

#### Returns

`JSONValue` \| `undefined`

The resolved property value or the default value.

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Defined in: [packages/blue-context/src/property-resolver.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-28)

Returns the resolved property value or throws when missing.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue`

The resolved property value.

#### Throws

When the property cannot be resolved.

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: [packages/blue-context/src/property-resolver.ts:35](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-35)

Returns whether a property key can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.
