[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / NodeEnvironment

# Class: NodeEnvironment

Defined in: [packages/blue-platform-node/src/node-environment.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-environment.ts#lines-15)

Node.js environment implementation that includes `process.env` as the first property source.

Extends `StandardEnvironment` so that DI containers can discriminate between
browser and Node environments by class identity (e.g., `instanceof NodeEnvironment`).
All other environment behaviour (profiles, property resolution) is inherited.

## Extends

- `StandardEnvironment`

## Constructors

### Constructor

> **new NodeEnvironment**(`propertySources?`): `NodeEnvironment`

Defined in: [packages/blue-platform-node/src/node-environment.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-environment.ts#lines-21)

Creates a Node.js environment.

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

Additional property sources to merge (appended after `process.env`).

#### Returns

`NodeEnvironment`

#### Overrides

`StandardEnvironment.constructor`

## Accessors

### propertySources

#### Get Signature

> **get** **propertySources**(): `JSONObject`[]

Defined in: packages/blue-context/lib/environment.d.ts:67

The ordered property sources used for resolution.

##### Returns

`JSONObject`[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Defined in: packages/blue-context/lib/environment.d.ts:68

The ordered property sources used for resolution.

##### Parameters

###### propertySources

`JSONObject`[]

##### Returns

`void`

#### Inherited from

`StandardEnvironment.propertySources`

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-context/lib/environment.d.ts:69

##### Returns

`string`

#### Inherited from

`StandardEnvironment.[toStringTag]`

***

### activeProfiles

#### Get Signature

> **get** **activeProfiles**(): `string`[]

Defined in: packages/blue-context/lib/environment.d.ts:70

The explicitly active profiles.

##### Returns

`string`[]

#### Set Signature

> **set** **activeProfiles**(`profiles`): `void`

Defined in: packages/blue-context/lib/environment.d.ts:71

The explicitly active profiles.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

#### Inherited from

`StandardEnvironment.activeProfiles`

***

### defaultProfiles

#### Get Signature

> **get** **defaultProfiles**(): `string`[]

Defined in: packages/blue-context/lib/environment.d.ts:72

The default profiles used when no active profile is configured.

##### Returns

`string`[]

#### Set Signature

> **set** **defaultProfiles**(`profiles`): `void`

Defined in: packages/blue-context/lib/environment.d.ts:73

The default profiles used when no active profile is configured.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

#### Inherited from

`StandardEnvironment.defaultProfiles`

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/lib/environment.d.ts:75

Adds a profile to the active set.

#### Parameters

##### profile

`string`

The profile name.

#### Returns

`void`

#### Inherited from

`StandardEnvironment.addActiveProfile`

***

### addDefaultProfile()

> **addDefaultProfile**(`profile`): `void`

Defined in: packages/blue-context/lib/environment.d.ts:76

Adds a profile to the default set.

#### Parameters

##### profile

`string`

The profile name.

#### Returns

`void`

#### Inherited from

`StandardEnvironment.addDefaultProfile`

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/lib/environment.d.ts:77

Returns whether a property key can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.

#### Inherited from

`StandardEnvironment.hasProperty`

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Defined in: packages/blue-context/lib/environment.d.ts:78

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

#### Inherited from

`StandardEnvironment.getProperty`

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Defined in: packages/blue-context/lib/environment.d.ts:79

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

#### Inherited from

`StandardEnvironment.getRequiredProperty`

***

### merge()

> **merge**(`environment`): `void`

Defined in: packages/blue-context/lib/environment.d.ts:80

Merges another environment into this one.

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to merge.

#### Returns

`void`

#### Inherited from

`StandardEnvironment.merge`

***

### \_isActiveProfile()

> `protected` **\_isActiveProfile**(`profile`): `boolean`

Defined in: packages/blue-context/lib/environment.d.ts:81

#### Parameters

##### profile

`string`

#### Returns

`boolean`

#### Inherited from

`StandardEnvironment._isActiveProfile`
