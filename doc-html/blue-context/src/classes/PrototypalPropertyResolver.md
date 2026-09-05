[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / PrototypalPropertyResolver

# Class: PrototypalPropertyResolver

Defined in: [packages/blue-context/src/property-resolver.ts:105](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-105)

Property resolver that layers sources through a prototype chain for lookup.

## Implements

- [`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md)

## Constructors

### Constructor

> **new PrototypalPropertyResolver**(`propertySources`): `PrototypalPropertyResolver`

Defined in: [packages/blue-context/src/property-resolver.ts:131](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-131)

#### Parameters

##### propertySources

`JSONObject`[]

#### Returns

`PrototypalPropertyResolver`

## Properties

### properties

> `readonly` **properties**: `JSONObject`

Defined in: [packages/blue-context/src/property-resolver.ts:107](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-107)

## Accessors

### propertySources

#### Get Signature

> **get** **propertySources**(): `JSONObject`[]

Defined in: [packages/blue-context/src/property-resolver.ts:112](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-112)

The ordered set of configured property sources.

##### Returns

`JSONObject`[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Defined in: [packages/blue-context/src/property-resolver.ts:121](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-121)

Replaces the property sources and rebuilds the prototype chain used for lookups.

##### Parameters

###### propertySources

`JSONObject`[]

The new property sources.

##### Returns

`void`

The ordered set of property sources used during resolution.

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`propertySources`](../interfaces/ConfigurablePropertyResolver.md#propertysources)

## Methods

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Defined in: [packages/blue-context/src/property-resolver.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-142)

Resolves a property value from the configured sources.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when the property is missing.

#### Returns

`JSONValue` \| `undefined`

The resolved property value or the default value.

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getProperty`](../interfaces/ConfigurablePropertyResolver.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Defined in: [packages/blue-context/src/property-resolver.ts:156](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-156)

Resolves a required property value.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue`

The resolved property value.

#### Throws

When the property cannot be resolved.

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getRequiredProperty`](../interfaces/ConfigurablePropertyResolver.md#getrequiredproperty)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: [packages/blue-context/src/property-resolver.ts:170](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/property-resolver.ts#lines-170)

Returns whether the property can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`hasProperty`](../interfaces/ConfigurablePropertyResolver.md#hasproperty)
